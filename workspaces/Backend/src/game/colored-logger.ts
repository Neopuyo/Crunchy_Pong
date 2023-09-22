import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class ColoredLogger extends Logger {
  private getColorPrefix(color: string, context?: string) {
    const reset = '\x1b[0m';
    return `${color}[GAME gateway] (${context}): ${reset}`;
  }

  log(message: any, context?: string) {
    if (
      process.env &&
      process.env.ENVIRONNEMENT &&
      process.env.ENVIRONNEMENT === 'build'
    )
      return;

    const blue = '\x1b[34m';
    process.stdout.write(
      this.getColorPrefix(blue, context) + ' ' + message + '\n',
    );
  }

  error(message: any, context?: string, trace?: string) {
    if (
      process.env &&
      process.env.ENVIRONNEMENT &&
      process.env.ENVIRONNEMENT === 'build'
    )
      return;

    const red = '\x1b[31m';
    process.stderr.write(
      this.getColorPrefix(red, context) + ' ' + message + '\n',
    );
    if (trace) {
      process.stderr.write(trace + '\n');
    }
  }

  warn(message: any, context?: string) {
    if (
      process.env &&
      process.env.ENVIRONNEMENT &&
      process.env.ENVIRONNEMENT === 'build'
    )
      return;
    const yellow = '\x1b[33m';
    process.stdout.write(
      this.getColorPrefix(yellow, context) + ' ' + message + '\n',
    );
  }
}
