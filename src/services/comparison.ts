import { FrameworkData, Control } from '@/types/framework';
import { FrameworkComparison, FrameworkSimilarities, FrameworkDifferences } from '@/types/comparison';
import { VersionInfo } from '@/types/version';

export class ComparisonService {
  private calculateControlSimilarity(control1: Control, control2: Control): number {
    if (!control1 || !control2) return 0;
    // Calculate similarity based on multiple factors
    let score = 0;
    let factors = 0;

    // Title similarity (using basic string matching for now)
    // In a production environment, we'd use more sophisticated NLP
    const title1 = control1.title || control1.name || '';
    const title2 = control2.title || control2.name || '';
    const titleWords1 = new Set(title1.toLowerCase().split(/\W+/));
    const titleWords2 = new Set(title2.toLowerCase().split(/\W+/));
    const commonWords = new Set([...titleWords1].filter(x => titleWords2.has(x)));
    const titleSimilarity = commonWords.size / Math.max(titleWords1.size, titleWords2.size);
    score += titleSimilarity;
    factors++;

    // Category similarity
    if (control1.category && control2.category && control1.category === control2.category) {
      score += 1;
      factors++;
    }

    // Description similarity (basic implementation)
    if (control1.description && control2.description) {
      const descWords1 = new Set(control1.description.toLowerCase().split(/\W+/));
      const descWords2 = new Set(control2.description.toLowerCase().split(/\W+/));
      const commonDescWords = new Set([...descWords1].filter(x => descWords2.has(x)));
      const descSimilarity = commonDescWords.size / Math.max(descWords1.size, descWords2.size);
      score += descSimilarity;
      factors++;
    }

    return score / factors;
  }

  private findSimilarControls(sourceControl: Control, targetControls: Control[] = [], threshold: number = 0.7): Control | null {
    const similarities = targetControls.map(targetControl => ({
      control: targetControl,
      similarity: this.calculateControlSimilarity(sourceControl, targetControl)
    }));

    const bestMatch = similarities.reduce((best, current) => 
      current.similarity > best.similarity ? current : best
    , { control: null, similarity: 0 });

    return bestMatch.similarity >= threshold ? bestMatch.control : null;
  }

  private calculateSimilarities(source: FrameworkData, target: FrameworkData, mappedControls: Map<string, string>): FrameworkSimilarities {
    // Find common categories
    const sourceCategories = new Set(source.controls.filter(c => c && c.category).map(c => c.category));
    const targetCategories = new Set(target.controls.filter(c => c && c.category).map(c => c.category));
    const commonCategories = Array.from(new Set([...sourceCategories].filter(x => x && targetCategories.has(x))));

    // Find shared objectives based on control descriptions
    const sourceObjectives = new Set(source.controls
      .filter(c => c && c.description)
      .flatMap(c => c.description.toLowerCase().match(/\b(ensure|protect|maintain|implement|provide)\b.*?[.]/g) || []
    ));
    const targetObjectives = new Set(target.controls
      .filter(c => c && c.description)
      .flatMap(c => c.description.toLowerCase().match(/\b(ensure|protect|maintain|implement|provide)\b.*?[.]/g) || []
    ));
    const sharedObjectives = Array.from(new Set([...sourceObjectives].filter(x => x && targetObjectives.has(x))))
      .map(obj => obj.charAt(0).toUpperCase() + obj.slice(1))
      .slice(0, 5); // Limit to top 5 objectives

    return {
      commonControls: mappedControls.size,
      commonCategories,
      sharedObjectives
    };
  }

  private calculateDifferences(source: FrameworkData, target: FrameworkData, mappedControls: Map<string, string>): FrameworkDifferences {
    const mappedSourceControls = new Set(mappedControls.keys());
    const mappedTargetControls = new Set(mappedControls.values());

    const uniqueSourceControls = source.controls
      .filter(c => c && c.id && !mappedSourceControls.has(c.id))
      .map(c => c.id);

    const uniqueTargetControls = target.controls
      .filter(c => c && c.id && !mappedTargetControls.has(c.id))
      .map(c => c.id);

    // Analyze scope differences
    const scopeDifferences: string[] = [];
    
    // Compare industries
    if (source.industries?.some(i => !target.industries?.includes(i))) {
      scopeDifferences.push('Different industry focus');
    }

    // Compare control count
    const controlDiff = Math.abs(source.controls.length - target.controls.length);
    if (controlDiff > 5) {
      scopeDifferences.push('Significant difference in number of controls');
    }

    // Compare categories
    const sourceCategories = new Set(source.controls.map(c => c.category));
    const targetCategories = new Set(target.controls.map(c => c.category));
    if ([...sourceCategories].some(c => !targetCategories.has(c))) {
      scopeDifferences.push('Different control categories');
    }

    return {
      uniqueControls: {
        framework1: uniqueSourceControls,
        framework2: uniqueTargetControls
      },
      scopeDifferences
    };
  }

  private estimateImplementation(source: FrameworkData, target: FrameworkData, similarities: FrameworkSimilarities): {
    timelineMonths: number;
    complexity: 'low' | 'medium' | 'high';
  } {
    // Base implementation time (1 month per 20 controls)
    const baseTime = Math.ceil(target.controls.length / 20);
    
    // Adjustment based on common controls
    const commonRatio = similarities.commonControls / target.controls.length;
    const adjustedTime = baseTime * (2 - commonRatio); // Less time if more common controls

    // Determine complexity
    let complexity: 'low' | 'medium' | 'high' = 'medium';
    if (commonRatio > 0.7) complexity = 'low';
    if (commonRatio < 0.3) complexity = 'high';

    return {
      timelineMonths: Math.round(adjustedTime),
      complexity
    };
  }

  private formatVersion(version: string | VersionInfo): string {
    if (typeof version === 'string') {
      return version;
    }
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  public compareFrameworks(source: FrameworkData, target: FrameworkData): FrameworkComparison {
    // Map similar controls
    const mappedControls = new Map<string, string>();
    
    source.controls.forEach(sourceControl => {
      const similarControl = this.findSimilarControls(sourceControl, target.controls);
      if (similarControl) {
        mappedControls.set(sourceControl.id, similarControl.id);
      }
    });

    // Calculate similarities
    const similarities = this.calculateSimilarities(source, target, mappedControls);
    
    // Calculate differences
    const differences = this.calculateDifferences(source, target, mappedControls);

    // Calculate implementation estimate
    const implementationEstimate = this.estimateImplementation(source, target, similarities);

    // Calculate overall similarity score
    const similarityScore = similarities.commonControls / Math.max(source.controls.length, target.controls.length);

    // Create mappings array from the map
    const mappingsArray = Array.from(mappedControls.entries()).map(([sourceId, targetId]) => ({
      sourceControlId: sourceId,
      targetControlId: targetId,
      mappingType: 'direct' as const,
      coverage: 1.0,
      notes: 'Automatically mapped based on control similarity'
    }));

    // Create gap analysis
    const gapAnalysis = {
      coverage: similarityScore,
      unmappedSourceControls: differences.uniqueControls.framework1,
      unmappedTargetControls: differences.uniqueControls.framework2,
      recommendations: [
        'Review unmapped controls for potential manual mapping',
        'Consider updating control descriptions to improve automatic mapping',
        'Evaluate if unmapped controls are necessary for your compliance needs'
      ]
    };

    return {
      sourceFramework: {
        ...source,
        version: this.formatVersion(source.version)
      },
      targetFramework: {
        ...target,
        version: this.formatVersion(target.version)
      },
      similarities,
      differences,
      controls: [], // This would be populated with detailed control mappings if needed
      mappings: mappingsArray,
      gapAnalysis,
      statistics: {
        similarityScore,
        totalControls: {
          source: source.controls.length,
          target: target.controls.length,
          common: similarities.commonControls
        },
        implementationEstimate
      }
    };
  }
}
