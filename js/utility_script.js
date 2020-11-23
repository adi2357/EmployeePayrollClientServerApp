const stringifyDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const newDate = !date ? "undefined" : new Date(Date.parse(date)).toLocaleDateString('en-GB', options);
    return newDate;
}

const checkName = (name) => {
    const NAME_REGEX = RegExp("^[A-Z]{1}[a-z]{2,}([ ][A-Z]{1}[a-z]{2,})?$");
    if (NAME_REGEX.test(name)) {
        this._name = name;
    } else throw "Name is Incorrect!";
};

const checkStartDate = (startDate) => {
    let now = new Date();
    if (startDate > now) throw "Start Date is a Futute Date!";
    let difference = Math.abs(now.getTime() - startDate.getTime());
    if (difference / (1000 * 60 * 60 * 24) > 30) {
        throw "Start Date is beyond 30 days!";
    }
};