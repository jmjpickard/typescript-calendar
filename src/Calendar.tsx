import moment from 'moment';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Day } from './Day';
import styles from './newCalendar.module.scss';

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export interface DaysProps {
  day: string;
  date: string;
  booked: boolean;
  bookedBy: string;
  selected: boolean;
}

export interface Booking {
  id: number;
  owner?: string;
  title?: string;
  description?: string;
  start_date: string;
  end_date: string;
  approved?: boolean;
}

interface CalendarProps {
  events?: Booking[];
  onEventClick: (day: DaysProps) => void;
  setSelectedEvent: Dispatch<SetStateAction<Booking | undefined>>;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

const buildDays = (dayDiff: number, firstMondayWeekOfMonth: moment.Moment, events: Booking[] | undefined) => {
  let days: DaysProps[] = [];
  for (let x = 0; x <= dayDiff; x++) {
    const currentDate = moment(firstMondayWeekOfMonth).add(x, 'days');
    const isBooked = events?.find(
      (e) => currentDate <= moment(new Date(e.end_date)) && currentDate >= moment(new Date(e.start_date)),
    );
    days = [
      ...days,
      {
        day: currentDate.format('DD'),
        date: currentDate.format('YYYY-MM-DD hh:mm'),
        booked: isBooked ? true : false,
        bookedBy: isBooked?.owner ?? '',
        selected: false,
      },
    ];
  }
  return days;
};

export const NewCalendar: React.FC<CalendarProps> = ({
  events,
  onEventClick,
  setSelectedEvent,
  onStartDateChange,
  onEndDateChange,
}) => {
  const today = moment();
  const [date, setDate] = useState(today);

  const [firstDayOfMonth, setFirstDayOfMonth] = useState(moment().startOf('month'));
  const [firstMondayWeekOfMonth, setFirstMondayWeekOfMonth] = useState(moment().startOf('month').day(1));
  const [lastDayOfMonth, setLastDayOfMonth] = useState(today.endOf('month'));
  const [lastSundayWeekOfMonth, setLastSundayWeekOfMonth] = useState(moment(lastDayOfMonth).day(6));
  const [dayDiff, setDayDiff] = useState(lastSundayWeekOfMonth.diff(firstMondayWeekOfMonth, 'days') + 1);
  const [days, setDays] = useState<DaysProps[]>(buildDays(dayDiff, firstMondayWeekOfMonth, events));

  useEffect(() => {
    setDays(buildDays(dayDiff, firstMondayWeekOfMonth, events));
  }, [dayDiff, firstMondayWeekOfMonth, events]);

  const [onStart, setOnStart] = useState(true);

  const handleArrowClick = (isForward: boolean) => {
    const newDate = isForward ? date.add(1, 'month') : date.subtract(1, 'month');
    const firstOfMonth = moment(newDate).startOf('month');
    const firstMonday = moment(firstOfMonth).day(1);
    const lastDay = moment(newDate).endOf('month');
    const lastSunday = moment(lastDay).day(6);
    const diff = moment(lastSunday).diff(moment(firstMonday), 'days') + 1;

    setDate(newDate);
    setFirstDayOfMonth(firstOfMonth);
    setFirstMondayWeekOfMonth(firstMonday);
    setLastDayOfMonth(lastDay);
    setLastSundayWeekOfMonth(lastSunday);
    setDayDiff(diff);
    setDays(buildDays(diff, firstMonday, events));
  };

  const handleDayClick = (day: DaysProps) => {
    const selectedDate = moment(new Date(day.date));
    if (day.booked) {
      setSelectedEvent(
        events?.find(
          (e) => selectedDate <= moment(new Date(e.end_date)) && selectedDate >= moment(new Date(e.start_date)),
        ),
      );
    }
    if (onStart && !day.booked) {
      onStartDateChange?.(day.date);
      setDays(
        days.map((d) => {
          if (d.date === day.date) {
            return { ...d, selected: true };
          }
          return { ...d, selected: false };
        }),
      );
    } else if (!day.booked) {
      onEndDateChange?.(day.date);
      const startDate = days.find((d) => d.selected);
      setDays(
        days.map((d) => {
          const dDate = new Date(d.date);
          const dayDate = new Date(day.date);
          if (!startDate) {
            return { ...d, selected: false };
          }
          if (dDate <= dayDate && dDate >= new Date(startDate.date)) {
            return { ...d, selected: true };
          }
          return { ...d, selected: false };
        }),
      );
    }
    setOnStart(!onStart);
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.topDisplay}>
        <div>{firstDayOfMonth.format('MMM YYYY')}</div>
        <div className={styles.arrowContainer}>
          <div
            onClick={() => {
              handleArrowClick(false);
            }}
            className={styles.arrow}
          >
            &#x2190;
          </div>
          <div
            onClick={() => {
              handleArrowClick(true);
            }}
            className={styles.arrow}
          >
            &#x2192;
          </div>
        </div>
      </div>
      <div className={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.dayContainer}>
        {days.map((day, idx) => {
          return (
            <React.Fragment key={idx}>
              <Day day={day} topRow={idx < 7} onClick={handleDayClick} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
