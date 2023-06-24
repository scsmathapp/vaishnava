import _ from 'lodash';
import cities from './cities';
import locationImport from '../cal/location-52';

export default {
  weeks: [],
  day1Index: 0,
  dayLastIndex: 0,
  index: 0,
  year: 0,
  today: {},
  selectedDate: {},
  selectedLocation: { name: 'Select Location...' },
  calDates: {},
  isDateSelected: true,
  months: [{ name: 'January', days: 31 }, { name: 'February', days: 28 }, { name: 'March', days: 31 }, { name: 'April', days: 30 }, { name: 'May', days: 31 }, { name: 'June', days: 30 }, { name: 'July', days: 31 }, { name: 'August', days: 31 }, { name: 'September', days: 30 }, { name: 'October', days: 31 }, { name: 'November', days: 30 }, { name: 'December', days: 31 }],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  cal: {},
  loadCalendar() {
    const today = new Date(),
     location = localStorage.location;
    let todayObj;

    todayObj = this.init({
      date: today.getDate(),
      day: today.getDay(),
      month: today.getMonth(),
      year: today.getFullYear() 
    });

    this.today = this.cal[todayObj];

    if (location) {
      _.each(cities, city => {
        if(city['city_id'] == location) {
          this.selectLocation({ location: city });
          return false;
        }
      });
    }
  },
  selectLocation({ location }) {
    if (!this.calDates[location['city_id']]) {
      // import('../cal/location-' + location['city_id'] + '.js')
      //   .then(locationImport => {
          this.loadLocation({ location, locationImport: locationImport });
        // })
    } else {
      this.loadLocation({ location });
    }
  },
  loadLocation({ location, locationImport }) {
    let dateToSelect;

    this.selectedLocation = location;
    localStorage.location = location['city_id'];

    if (!this.calDates[this.selectedLocation['city_id']]) {
      this.calDates[this.selectedLocation['city_id']] = locationImport;
    }

    _.each(this.calDates[this.selectedLocation['city_id']], (date, dateText) => {
      let dateTextSplit = dateText.split('-');

      date.dateText = dateText;
      date.year = parseInt(dateTextSplit[0]);
      date.month = parseInt(dateTextSplit[1]) - 1;
      date.date = parseInt(dateTextSplit[2]);
      
      _.each(date.events, dateEvent => {
        if (dateEvent.img) {
          let url = 'url(../assets/img/' + dateEvent.img + '.jpg)';
          if (!date.url) {
            date.url = url;
          }
          dateEvent.url = url;
        }
      });
    });

    if (this.selectedDate && this.selectedDate.date) {
      dateToSelect = this.selectedDate;
    } else {
      dateToSelect = this.today;
    }

    this.selectDate(dateToSelect);
  },
  setMonth(date, dateIndex, monthIndex, year) {
    if (this.year !== year) {
      this.checkFeb();
    }

    this.year = year;
    this.index = monthIndex;
    this.weeks = [];
    this.day1Index = date === 1 ? dateIndex : ((dateIndex - (date % 7)) + 1 + 7) % 7;

    this.fillMonth(0, 1);
  },
  fillMonth(weekNo, date) {
    let lastDayReached = false,
      params = { todayText: this.today.dateText, calDates: this.calDates[this.selectedLocation['city_id']] },
      itrDate;

    this.weeks.push([]);

    for (let i = 0; i < 7; i++) {
      itrDate = { date, month: this.index, year: this.year, dayIndex: i };
      if ((weekNo == 0 && i < this.day1Index) || lastDayReached) {
        this.weeks[weekNo].push('');
      } else {
        let appDate = this.init(itrDate, params);
        this.weeks[weekNo].push(appDate);
        if (date === this.months[this.index].days) {
          lastDayReached = true;
          this.dayLastIndex = i;
          console.log(this);
        }
        date++;
      }
    }
    if (!lastDayReached) {
      this.fillMonth(weekNo + 1, date);
    }
  },
  getPrev() {
    let year = this.index !== 0 ? this.year : this.year - 1,
      index = (this.index + 11) % 12
  
    this.setMonth(this.months[index].days, (this.day1Index + 6) % 7, index, year);
  },
  getNext() {
    let year = this.index !== 11 ? this.year : this.year + 1;

    this.setMonth(1, (this.dayLastIndex + 1) % 7, (this.index + 1) % 12, year);
  },
  selectDate(date) {
    let prevDate = this.selectedDate;

    if (date.dateText && !date.day) date.day = new Date(date.dateText).getDay();

    if (date.month != this.index || date.year != this.year || this.weeks.length < 1) {
      this.setMonth(date.date, date.day, date.month, date.year);
    }

    if (prevDate.dateText) {
      this.select(prevDate.dateText);
    }
    
    this.select(date.dateText);
    this.selectedDate = date;
    this.isDateSelected = true;
  },
  checkFeb() {
    if ((this.year % 4) === 0) {
      this.months[1].days = 29;
    } else {
      this.months[1].days = 28;
    }
  },
  setIsDateSelected(isDateSelected) {
    this.isDateSelected = isDateSelected;
  },
  select(dateText) {
    this.cal[dateText].selected = this.cal[dateText].selected ? false : true;
    this.setColor(dateText);
  },
  setColor(dateText) {
    if (this.cal[dateText].today) {
      this.cal[dateText].bg = 'rgba(255, 165, 0, 0.7)';
    } else if (this.cal[dateText].selected) {
      this.cal[dateText].bg = 'rgba(255, 165, 0, 0.4)';
    } else {
      this.cal[dateText].bg = '';
    }

    if (this.cal[dateText].dayIndex === 0) {
      this.cal[dateText].color = 'rgb(255, 0, 0)';
    }
  },
  init(date, params) {
    let dateText = date.dateText || date.year + '-' + ('0' + (date.month + 1)).slice(-2) + '-' + ('0' + date.date).slice(-2);

    if (params) {
      if (params.calDates && params.calDates[dateText]) {
        this.cal[dateText] = params.calDates[dateText];
      } else {
        this.cal[dateText] = date;
      }
      
      this.cal[dateText].today = params.todayText === dateText;
    } else {
      this.cal[dateText] = date;
    }
    this.setColor(dateText);

    this.cal[dateText].dateText = dateText;

    return dateText;
  }
}