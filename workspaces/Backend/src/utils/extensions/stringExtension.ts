import { filterBadWords } from '../badwords/filterBadWords';

declare global {
  interface String {
    filterBadWords(): string;
  }
}

String.prototype.filterBadWords = function () {
  return filterBadWords(this);
};
