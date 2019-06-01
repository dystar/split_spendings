function Person(name) {
  this.name = name;
}

function Purchase(title, amount) {
  this.title = title;
  this.amount = amount;
}

function SpendList(title) {
  this.title = title;
  this.spendings = [];
}
SpendList.prototype.addSpending = function(purchase, buyer, group) {
  var spending = {
    purchase: purchase,
    buyer: buyer,
    group: group
  };
  this.spendings.push(spending);
}
SpendList.prototype.calcDebts = function() {
  var debts = {};
  this.spendings.forEach(spending => {
    var equalShare = spending.purchase.amount / spending.group.length;
    
    spending.group.forEach(person => {
      debts[person.name] = debts[person.name] || 0;
      debts[person.name] += equalShare;
    })
    
    debts[spending.buyer.name] -= spending.purchase.amount;
  })
  return debts;
}
SpendList.prototype.calcTransfers = function() {
  var debts = this.calcDebts();
  var transfers = [];
  for (var i in debts) {
    if (debts[i] > 0) {
      for (var j in debts) {
        if(debts[j] < 0) {
          var tempLeft = debts[i];
          var tempRight = debts[i];
          debts[i] = (debts[i] + debts[j] > 0) ? debts[i] + debts[j] : 0;
          debts[j] = debts[i] ? 0 : debts[j] + tempLeft;
          transfers.push(i + " " + (debts[i] + tempLeft).toFixed(2) + " -> " + j);
        }
      }
    }
  }
  return transfers;
}


var persons = [];
var lists = [];

function draw_persons() {
  var personsHTML = persons.map(person => "<p>" + person.name + "</p>");
  document.querySelector("#persons").innerHTML = personsHTML.join("");
}

document.querySelector("#add_person").onsubmit = function(event) {
  event.preventDefault();
  if(this.elements.person_name.value) {
    persons.push(new Person(this.elements.person_name.value));
    draw_persons();
	draw_lists();
	this.reset();
  }
}

function draw_lists() {
  var listsHTML = lists.map((list, i) => {
    var res = "<h4>" + list.title + "</h4> <button class='add_spending btn btn-primary'>Добавить трату</button>";
	
	var personsList = persons.map((person, i) => "<option value='" + i + "'>" + person.name + "</option>");
	var personsListSelected = persons.map((person, i) => "<option value='" + i + "' selected='selected'>" + person.name + "</option>");
	var newSpendForm = "<form class='spend_form d-none' data-list='" + i + "'> \
							<input type='hidden' name='list' value='" + i + "' class='form-control'> \
							<label>Трата</label> \
							<input type='text' name='title' placeholder='Еда в супермаркете' class='form-control'> \
							<label>Сумма</label> \
							<input type='text' name='amount' placeholder='2000' class='form-control'> \
							<label>Покупатель</label> \
							<select name='buyer' class='form-control'>" + personsList + "</select> \
							<label>Участники</label> \
							<select multiple name='group' class='form-control'>" + personsListSelected + "</select> \
							<button type='submit' class='btn btn-primary'>Добавить</button> \
						</form>";
	var spendsHTML = list.spendings.map((spend, i) => "<p>" + spend.purchase.title + "(" + spend.purchase.amount + ")" + "</p>");
	var debts = "<h5>Долги</h5><div class='debts'>" + list.calcTransfers().join("<br>") + "</div>";
	return "<div class='border p-3 mb-2'>" + spendsHTML.join("") + res + newSpendForm + debts + "</div>";
  });
  document.querySelector("#lists").innerHTML = listsHTML.join("");
  
  if(document.querySelector(".add_spending")) 
	  document.querySelectorAll(".add_spending").forEach(el => {el.onclick = function() {
		this.nextSibling.className = this.nextSibling.className.replace(/d-none/, "");
	  }
	  })
  if(document.querySelector(".spend_form"))
	  document.querySelectorAll(".spend_form").forEach(el => {el.onsubmit = function(event) {
		event.preventDefault();
		var buyer = persons[this.elements["buyer"].value];
		var group = [...this.elements.group.options].filter(el => el.selected == true).map(el => persons[el.value]);
		
		if(this.elements.title.value && this.elements.amount.value)
			var purchase = new Purchase(this.elements.title.value, this.elements.amount.value);
		
		if(purchase && buyer && group)
			lists[this.dataset.list].addSpending(purchase, buyer, group);
		
		draw_lists();
	  }
	  })
}

document.querySelector("#add_list").onsubmit = function(event) {
  event.preventDefault();
  if(this.elements.list_title.value) {
    lists.push(new SpendList(this.elements.list_title.value));
    draw_lists();
	this.reset();
  }
}


var vasya = new Person("Вася");
var petya = new Person("Петя");
var sasha = new Person("Саша");

var fridayEating = new SpendList("Пятничная еда");

var burgers = new Purchase("Бургерная", 1500);
var bar = new Purchase("Бар", 5000);
fridayEating.addSpending(burgers, sasha, [vasya, petya, sasha]);
fridayEating.addSpending(bar, petya, [sasha, petya]);
console.log(fridayEating.calcDebts());
console.log(fridayEating.calcTransfers());