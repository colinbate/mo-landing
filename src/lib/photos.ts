import type { ImageMetadata } from 'astro';
import { campaign } from '../config/campaign';

export interface DailyPhoto {
  /** 1-based day of the campaign. */
  day: number;
  date: Date;
  /** Short human label such as "Nov 2". */
  dateLabel: string;
  image: ImageMetadata;
}

/**
 * Drop `day-NN.jpg` files into `src/assets/mo/` and they show up here
 * automatically, sorted by day number.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/mo/day-*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const dateFormatter = new Intl.DateTimeFormat(campaign.locale, {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function dateForDay(day: number): Date {
  return new Date(Date.UTC(campaign.year, campaign.photoStart.month - 1, campaign.photoStart.day + day - 1));
}

export function getPhotos(): DailyPhoto[] {
  return Object.entries(modules)
    .flatMap(([path, mod]) => {
      const match = path.match(/day-(\d+)\.\w+$/);
      if (!match) return [];
      const day = Number.parseInt(match[1], 10);
      const date = dateForDay(day);
      return [{ day, date, dateLabel: dateFormatter.format(date), image: mod.default }];
    })
    .sort((a, b) => a.day - b.day);
}
