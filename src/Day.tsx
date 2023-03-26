import React from 'react';
import { DaysProps } from './Calendar';
import styles from './newCalendar.module.scss';
import clx from 'classnames';

interface DayArgs {
  day: DaysProps;
  topRow: boolean;
  onClick: (day: DaysProps) => void;
  bookedColor?: string;
}

export const Day: React.FC<DayArgs> = ({ day, topRow, onClick, bookedColor }: DayArgs) => {
  return (
    <div
      key={day.date}
      className={clx(styles.day, {
        [styles.topRow as string]: topRow,
        [styles.selected as string]: day.selected,
        [styles.booked as string]: day.booked,
      })}
      onClick={() => onClick(day)}
    >
      <div className={styles.dayNumber}>{day.day}</div>
      {day.booked && <div className={styles.bookedDay} style={{ backgroundColor: bookedColor }}></div>}
    </div>
  );
};
