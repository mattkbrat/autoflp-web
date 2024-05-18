const times = [
	"twelve",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"ten",
	"eleven",
	"midnight",
];

/* makes fuzzy time */
export class Time {
	date: Date;
	withPM: boolean;
	constructor(withPM = false) {
		this.date = new Date();
		this.withPM = withPM;
	}

	get mornOrAfter() {
		return this._hrs > 12 ? "afternoon" : "morning";
	}

	get _hrs() {
		return this.date.getHours();
	}

	get hrs() {
		let hours = this._hrs;
		if (this.mins >= 37) {
			hours++;
		}
		return hours >= 12 ? times[hours - 12] : times[hours];
	}

	get mins() {
		return this.date.getMinutes();
	}

	update(date: Date) {
		this.date = date;
	}

	get fuzzyTime() {
		let res = "";
		const suffix = this.withPM ? ` in the ${this.mornOrAfter}` : "";

		if (this.mins < 7) res = `${this.hrs} O'clock${suffix}`;
		else if (this.mins < 22) res = `Quarter past ${this.hrs}${suffix}`;
		else if (this.mins < 37) res = `Half past ${this.hrs}${suffix}`;
		else if (this.mins < 52) res = `Quarter to ${this.hrs}${suffix}`;
		else if (this.mins <= 60) res = `${this.hrs} O'clock${suffix}`;

		return res.toLocaleLowerCase();
	}
}
