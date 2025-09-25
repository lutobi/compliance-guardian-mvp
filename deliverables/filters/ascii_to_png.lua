-- Pandoc Lua filter: Convert ASCII diagram code blocks to images for DOCX
-- Strategy:
-- 1) Detect fenced code blocks with classes: 'ascii', 'diagram', or 'svgbob'.
-- 2) Use 'svgbob' to convert ASCII art to SVG.
-- 3) Prefer PNG output using one of: ImageMagick ('magick' or 'convert'), rsvg-convert, or Inkscape.
--    Fall back to embedding SVG if PNG conversion tools are unavailable.
-- 4) If svgbob is unavailable or conversion fails, fall back to original CodeBlock.
--
-- This filter inserts the generated image into Pandoc's mediabag and returns an Image block
-- so that DOCX output embeds the raster/vector image instead of monospaced text that can wrap.

local utils = pandoc and pandoc.utils or {}

local function has_cmd(cmd, args)
  args = args or {"--version"}
  local ok, _ = pcall(pandoc.pipe, cmd, args, "")
  return ok
end

local function classes_set(cb)
  local set = {}
  if cb and cb.attr and cb.attr.classes then
    for _, c in ipairs(cb.attr.classes) do
      set[c] = true
    end
  end
  return set
end

local function looks_like_ascii_diagram(text)
  -- Heuristic: multiple lines and presence of common ASCII diagram chars
  if not text or #text < 8 then return false end
  local lines = 0
  for _ in text:gmatch("\n") do lines = lines + 1 end
  if lines < 2 then return false end
  local score = 0
  local chars = {"+","-","|","/","\\","_",":",".","#","<",">","(",")","[","]"}
  for _, ch in ipairs(chars) do
    -- plain=true ensures literal search, no pattern magic
    if text:find(ch, 1, true) ~= nil then
      score = score + 1
    end
  end
  return score >= 3
end

local function svg_from_ascii(ascii)
  -- svgbob: read from stdin, output SVG to stdout
  local ok, out = pcall(pandoc.pipe, "svgbob", {"-f", "svg"}, ascii)
  if ok and out and #out > 0 then return out end
  return nil
end

local function try_magick(svg)
  -- ImageMagick v7+: 'magick svg:- png:-'; v6: 'convert svg:- png:-'
  local ok, out = pcall(pandoc.pipe, "magick", {"svg:-", "png:-"}, svg)
  if ok and out and #out > 0 then return out end
  local ok2, out2 = pcall(pandoc.pipe, "convert", {"svg:-", "png:-"}, svg)
  if ok2 and out2 and #out2 > 0 then return out2 end
  return nil
end

local function try_rsvg(svg)
  local ok, out = pcall(pandoc.pipe, "rsvg-convert", {"-f", "png"}, svg)
  if ok and out and #out > 0 then return out end
  return nil
end

local function try_inkscape(svg)
  -- Inkscape ≥1.0: --pipe reads stdin; --export-type=png; --export-filename=- writes stdout
  local ok, out = pcall(pandoc.pipe, "inkscape", {"--pipe", "--export-type=png", "--export-filename=-"}, svg)
  if ok and out and #out > 0 then return out end
  -- Legacy fallback (may not work depending on version)
  local ok2, out2 = pcall(pandoc.pipe, "inkscape", {"--export-png=-", "--pipe"}, svg)
  if ok2 and out2 and #out2 > 0 then return out2 end
  return nil
end

local function png_from_svg(svg)
  -- Try a sequence of available converters
  if has_cmd("magick") or has_cmd("convert") then
    local out = try_magick(svg)
    if out then return out end
  end
  if has_cmd("rsvg-convert") then
    local out = try_rsvg(svg)
    if out then return out end
  end
  if has_cmd("inkscape") then
    local out = try_inkscape(svg)
    if out then return out end
  end
  return nil
end

local function unique_name(ext)
  local base
  if utils and utils.sha1 then
    base = utils.sha1(tostring(os.time()) .. tostring(math.random()))
  else
    base = tostring(os.time()) .. "-" .. tostring(math.random(1, 1e9))
  end
  return string.format("ascii-diagram-%s.%s", base, ext)
end

local function image_block_from_bytes(bytes, mime, alt, width_in)
  local name = unique_name(mime == "image/png" and "png" or "svg")
  pandoc.mediabag.insert(name, mime, bytes)
  -- pandoc.Image(caption, src, title, attr); caption is list of inlines
  local caption = { pandoc.Str(alt or "diagram") }
  local img = pandoc.Image(caption, name)
  img.attr = img.attr or pandoc.Attr()
  img.attr.attributes = img.attr.attributes or {}
  -- For DOCX, specifying width in inches helps prevent oversizing.
  img.attr.attributes["width"] = width_in or "6in"
  return pandoc.Para({ img })
end

function CodeBlock(cb)
  local cls = classes_set(cb)
  local is_target = cls["ascii"] or cls["diagram"] or cls["svgbob"] or looks_like_ascii_diagram(cb.text)
  if not is_target then return nil end

  if not has_cmd("svgbob") then
    -- No svgbob; keep original code block as fallback
    return nil
  end

  local svg = svg_from_ascii(cb.text)
  if not svg then
    return nil
  end

  local png = png_from_svg(svg)
  local alt = (cb.attr and cb.attr.attributes and cb.attr.attributes.alt) or "diagram"

  if png then
    return image_block_from_bytes(png, "image/png", alt, cb.attr and cb.attr.attributes and cb.attr.attributes.width)
  else
    -- Fallback to embedding SVG (Pandoc will rasterize for DOCX if possible)
    return image_block_from_bytes(svg, "image/svg+xml", alt, cb.attr and cb.attr.attributes and cb.attr.attributes.width)
  end
end
