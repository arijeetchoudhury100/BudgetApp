var budgetController = (function(){
    //takes care of data processing

    //data structures to store info about income and expenses
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur,idx,arr){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            //ID = last id + 1
            if(data.allItems[type].length === 0)
                ID = 0;
            else
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            
            //create new Item
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
            else{
                newItem = new Income(ID,des,val);
            }

            //push item to the data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, ID){
            var ids, index;
            //map returns a new array
            //create an array of IDs
            ids = data.allItems[type].map(function(cur,idx,arr){
                return cur.id;
            });

            //find index of required ID
            index = ids.indexOf(ID);

            if(index !== -1){
                //delete using splice
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate % if income spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            else
                data.percentage = -1;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        testing: function(){
            return data;
        }
    };
})();

var UIController = (function(){
    //takes care of UI related issues

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncLabel: '.budget__income--value',
        budgetExpLabel: '.budget__expenses--value',
        budgetExpPercentLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
        } 

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    } 

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                // will be either inc or exp
            
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, ele;
            //create HTML string with placeholder text
            if(type === 'inc'){
                ele = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                ele = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace placeholder text
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
            
            //insert HTML into the DOM
            document.querySelector(ele).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID){
            var toDelete = document.getElementById(selectorID); 
            toDelete.parentNode.removeChild(toDelete);
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);        
            document.querySelector(DOMStrings.budgetIncLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.budgetExpLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.budgetExpPercentLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMStrings.budgetExpPercentLabel).textContent = '---';
            }
        },

        displayPercentage: function(perArr){
            var fields = document.querySelectorAll(DOMStrings.expPercentageLabel);
            //fields is a list and not an array
            //we can create our custom forEach function
  
            nodeListForEach(fields,function(cur,idx){
                if(perArr[idx] > 0 )
                    cur.textContent = perArr[idx] + '%';
                else
                    cur.textContent = '---';
            });
        },

        displayMonth: function(){
            var now, year, month, months;
            
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']; 
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            //querySelectorAll returns a list instead of an array
            //convert the list to an array
            fieldsArray = Array.prototype.slice.call(fields);
            
            //use foreach method to loop over all elements of the array
            //can also be done with for loop
            fieldsArray.forEach(function(cur, idx, arr){
                cur.value = "";
            });

            fieldsArray[0].focus();
        },

        changeType: function(){

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }
})();

var controller = (function(budgetCtrl,UICtrl){
    //takes care of communication between budget and UI controllers
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        //add key press event to entire document
        document.addEventListener('keypress', function(event){
            //console.log(event);
            //key code for enter key is 13
            if(event.keyCode === 13){
                //console.log('Enter was pressed');
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }

    var updateBudget = function(){
        //1. calculate budget
        budgetCtrl.calculateBudget();

        //2. return the budget
        var budget = budgetCtrl.getBudget();

        //3. display budget
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function(){
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from budget controller
        var allPerc = budgetCtrl.getPercentages();
    
        //3. update UI
        UICtrl.displayPercentage(allPerc);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        //1. get input data
        input = UICtrl.getInput();
        
        //2. check validity of input
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //3. add item to budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
        
            //4. add item to UI and clear fileds
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            //5. calculate and update budget
            updateBudget();

            //6. calculate and update percentages
            updatePercentages();
        } 
    }
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        //console.log(event.target);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from budegetcontroller data structure
            budgetCtrl.deleteItem(type,ID);

            //2. delete item from UI
            UICtrl.deleteListItem(itemID);
            
            //3. update and display new budget
            updateBudget();

            //4. calculate and update perentages
            updatePercentages();
        }
    }

    return {
        init: function(){
            console.log('application started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
            setupEventListeners();
        }
    };
})(budgetController,UIController);

controller.init();


