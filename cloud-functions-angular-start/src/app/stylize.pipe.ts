import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

interface Sentiment {
  score: number,
  magnitude: number
}

/*
 * Styles a message based on its sentiment.
 */
@Pipe({name: 'stylize'})
export class StylizePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(sentiment: Sentiment): string|SafeStyle {
    if (!sentiment) {
      return '';
    }

    let style = '';

    // Change font based on positive/negative score.
    if (sentiment.score >= 0.9) {
      style += `font-family: 'Bonbon', 'Roboto', 'Helvetica', sans-serif;`;
    } else if (sentiment.score >= 0.5) {
      style += `font-family: 'Crafty Girls', 'Roboto', 'Helvetica', sans-serif;`;
    } else if (sentiment.score <= -0.9) {
      style += `font-family: 'Creepster', 'Roboto', 'Helvetica', sans-serif;`;
    } else if (sentiment.score <= -0.5) {
      style += `font-family: 'Julee', 'Roboto', 'Helvetica', sans-serif;`;
    }

    // Make bold if the magnitude is greater than 1.
    if (sentiment.magnitude >= 1) {
      style += `font-weight: bold;`;
    }

    return style ? this.sanitizer.bypassSecurityTrustStyle(style) : '';
  }
}
