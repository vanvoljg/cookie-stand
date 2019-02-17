'use strict';
console.clear();

// helper functions

var _rand = function (a, b) {
  // takes in any two numbers in any order, returns a random float between them
  var min = Math.min(a, b);
  var max = Math.max(a, b);
  return (Math.random() * (max - min) + min);
};

var _12hr_list = function (a, b) {
  // takes in two numbers between 1 and 24, returns an array of strings in the range
  // formatted : ##:00 am for numbers 1-11, 12:00 pm for 12, ##:00 pm for 13-23,
  // and 12:00 am for 24
  var min = Math.floor( Math.min(a, b) );
  var max = Math.floor( Math.max(a, b) );
  var rtn = [];
  for (var i = min; i < max + 1; i++) { // up to max+1 for inclusive array
    if (i < 1) i = 1; // if started earlier than 1am, set to 1am;
    if (i < 12) {
      rtn.push(`${i}:00 am`);
      continue;
    } else if (i === 12) {
      rtn.push('12:00 pm');
      continue;
    } else if (i < 24) {
      rtn.push(`${i - 12}:00 pm`);
      continue;
    } else {
      rtn.push('12:00 am');
      break; // Do not continue past 24 for any reason
    }
  }
  return rtn;
};

// =====================================

var Fishcookie_store = function (store_location, min_hourly_cust, max_hourly_cust, avg_cookies_per_sale,
  open_at = 6, close_at = 20, list_of_sales = []) {
  this.store_location = store_location;
  this.min_hourly_cust = min_hourly_cust;
  this.max_hourly_cust = max_hourly_cust;
  this.avg_cookies_per_sale = avg_cookies_per_sale;
  this.list_of_sales = list_of_sales;
  this.open_at = open_at;
  this.close_at = close_at;
  list_of_stores.push(this);
};

var list_of_stores = [];

// defining methods for objects

Fishcookie_store.prototype.number_of_customers = function () {
  // returns a random number of customers in a given range.
  return _rand(this.min_hourly_cust, this.max_hourly_cust);
};

Fishcookie_store.prototype.calculate_cookies_per_hour = function () {
  // calculates cookies per hour
  // Returns a number of cookies in an hourly period
  // Takes no input, returns an integer
  return Math.floor(this.number_of_customers() * this.avg_cookies_per_sale);
};

Fishcookie_store.prototype.calculate_cookie_sales = function () {
  // pushes an hour's worth of cookie sales onto the this.list_of_sales array
  // then pushes the day's total as the final element.
  // Generated from open to close, but one fewer because: we don't sell anything
  // on the hour we close, so omit that from the list.

  this.list_of_sales = [];
  var total = 0;
  var sold = 0;

  for (var ch = this.open_at; ch < this.close_at; ch++) {
    sold = this.calculate_cookies_per_hour();
    total += sold;
    this.list_of_sales.push(sold);
  }

  // Also push the total sales numbers
  this.list_of_sales.push(total);
};

Fishcookie_store.prototype.render_current_sales = function () {
  // render function, produces a table row and appends it to the data table
  var target = document.getElementById('sales_section');
  var tr_el = document.createElement('tr');
  var td_el = document.createElement('td');

  td_el.textContent = this.store_location;
  tr_el.appendChild(td_el);

  for (var ii = 0; ii < this.list_of_sales.length; ii++) {
    td_el = document.createElement('td');
    td_el.textContent = this.list_of_sales[ii];
    tr_el.appendChild(td_el);
  }

  target.appendChild(tr_el);
};

Fishcookie_store.prototype.render_new_sales = function () {
  this.calculate_cookie_sales();
  this.render_current_sales();
};

var render_table_head = function (open_time = 6, close_time = 20) {
  // render table head by iterating through from open to close, then add a totals
  // column to the end.
  var target = document.getElementById('sales_section');
  var tr_el = document.createElement('tr');
  var td_el = document.createElement('td');

  // append an empty table cell at the beginning
  tr_el.appendChild(td_el);

  for (var ii = open_time; ii < 12; ii++) {
    td_el = document.createElement('td');
    td_el.textContent = `${ii}:00 am`;
    tr_el.appendChild(td_el);
  }
  if (ii === 12) {
    td_el = document.createElement('td');
    td_el.textContent = `${ii}:00 pm`;
    tr_el.appendChild(td_el);
    ii++;
  }
  for (ii; ii < close_time; ii++) {
    td_el = document.createElement('td');
    td_el.textContent = `${ii - 12}:00 pm`;
    tr_el.appendChild(td_el);
  }

  td_el = document.createElement('td');
  td_el.textContent = 'Daily Location Total';
  tr_el.appendChild(td_el);

  target.appendChild(tr_el);
};

var render_table_footer = function (open_time = 6, close_time = 20) {
  // render table footer by using the list of objects, for each index of
  // list_of_sales, add them together to a column total, but also have a running
  // grand total to print at the end of the row
  var target = document.getElementById('sales_section');
  var tr_el = document.createElement('tr');
  var td_el = document.createElement('td');
  var grand_total = 0;
  var hourly_total = 0;

  td_el.textContent = 'Totals';
  tr_el.appendChild(td_el);

  // Store.list_of_sales.length - 1 corresponds to the last element index in the
  // array
  for (var ii = 0; ii < (close_time - open_time); ii++) {
    // each new time slot needs a new hourly total, start at 0
    hourly_total = 0;

    for (var ij = 0; ij < list_of_stores.length; ij++) {
      hourly_total += list_of_stores[ij].list_of_sales[ii];
    }

    grand_total += hourly_total;

    td_el = document.createElement('td');
    td_el.textContent = hourly_total;
    tr_el.appendChild(td_el);
  }

  td_el = document.createElement('td');
  td_el.textContent = grand_total;
  tr_el.appendChild(td_el);

  // set an id on the footer row so we can find and change it later
  tr_el.setAttribute('id', 'sales_footer');

  target.appendChild(tr_el);
};

var populate_time_list = function () {
  var targets = document.getElementsByClassName('time_list');
  var option_el;

  for (var ii = 0; ii < targets.length; ii++) {
    // Hour zero should say 12:00 am
    var jj = 0;
    option_el = document.createElement('option');
    option_el.setAttribute('value', jj);
    option_el.textContent = '12:00 am';
    targets[ii].appendChild(option_el);

    for (jj = 1; jj < 12; jj++) {
      option_el = document.createElement('option');
      option_el.setAttribute('value', jj);
      // Always set the initial selection of open_at (first in the time_list)
      // to 6:00 am
      if (jj === 6 && ii === 0) option_el.setAttribute('selected', '');
      option_el.textContent = `${jj}:00 am`;
      targets[ii].appendChild(option_el);
    }
    // Noon is also a special case...

    option_el = document.createElement('option');
    option_el.setAttribute('value', jj);
    option_el.textContent = '12:00 pm';
    targets[ii].appendChild(option_el);

    for (jj++; jj < 24; jj++) {
      option_el = document.createElement('option');
      option_el.setAttribute('value', jj);
      // Always set initial selection of close_at (second item using time_list)
      // to 8:00 pm
      if (jj === 20 && ii === 1) option_el.setAttribute('selected', '');
      option_el.textContent = `${jj - 12}:00 pm`;
      targets[ii].appendChild(option_el);
    }
  }

};

var append_store = function(event) {
  event.preventDefault();

  new Fishcookie_store(event.target.store_location.value,
    event.target.min_hourly_cust.value,
    event.target.max_hourly_cust.value,
    event.target.avg_cookies_per_sale.value);

  // Now calculate new data for the new store
  list_of_stores[list_of_stores.length - 1].render_new_sales();

  // Now remove the last table row
  var table = document.getElementById('sales_section');
  table.removeChild(document.getElementById('sales_footer'));

  // Now render the table footer again
  render_table_footer();
};

new Fishcookie_store('1st and Pike', 23, 65, 6.3);
new Fishcookie_store('SeaTac Airport', 3, 24, 1.2);
new Fishcookie_store('Seattle Center', 11, 38, 3.7);
new Fishcookie_store('Capitol Hill', 20, 38, 2.3);
new Fishcookie_store('Alki', 2, 16, 4.6);


// populate the time list items
populate_time_list();

// time in 24-hour format, integers only!
render_table_head();

for (var i = 0; i < list_of_stores.length; i++) {
  list_of_stores[i].render_new_sales();
}

render_table_footer();

var form_target = document.getElementById('add_store_form');
form_target.addEventListener('submit', append_store);
