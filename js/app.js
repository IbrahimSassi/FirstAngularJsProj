
var app = angular.module('groceryListApp', ["ngRoute"]);

app.config(function ($routeProvider) {
    $routeProvider

        .when("/",{
            templateUrl:"views/groceryList.html",
            controller: "HomeController"
        })
        .when("/addItem",{
            templateUrl:"views/inputItem.html",
            controller: "GroceryListItemsController"
        })
        .when("/addItem/edit/:id",{
            templateUrl:"views/inputItem.html",
            controller: "GroceryListItemsController"
        })
        .otherwise({
        redirectTo:"/"
    })

})



app.service("GroceryService", function ($http) {
    var groceryService =[];
    groceryService.groceryItems = [];

    $http.get("data/server_data.json")
        .success(function (data) {
            groceryService.groceryItems = data;

            for(var item in groceryService.groceryItems){
                groceryService.groceryItems[item].date = new Date(groceryService.groceryItems[item].date);
            }
        })
        .error(function (data,status) {
            alert("Things went wrong");
        })


    groceryService.findById = function (id) {
        for(var item in groceryService.groceryItems)
        {
            if(groceryService.groceryItems[item].id===id)
            {
                return groceryService.groceryItems[item];
            }
        }
    };



    groceryService.getNewId = function () {
        if(groceryService.newId)
        {
            groceryService.newId++;
            return groceryService.newId;
        }
        else
        {
            var maxId = _.max(groceryService.groceryItems, function (entry) {
                return entry.id;
            })
            groceryService.newId = maxId.id+1;
            return groceryService.newId;
        }
    }

        groceryService.save = function (entryToAdd) {


            var updatedItem = groceryService.findById(entryToAdd.id);

            if(updatedItem)
            {
                $http.post("data/updated_item.json",entryToAdd)
                    .success(function () {

                        if(data.status==1)
                        {
                            updatedItem.completed = entryToAdd.completed;
                            updatedItem.itemName = entryToAdd.itemName;
                            updatedItem.date = entryToAdd.date;

                        }
                    })
                    .error(function (data,status) {

                    })

                ;
            }
            else
            {
                $http.post("data/added_item.json",entryToAdd)
                    .success(function (data) {
                        entryToAdd.id = data.newId;
                        data.newId = (parseInt(data.newId) + 1).toString() ;
                    })
                    .error(function (data,status) {

                    });




               // entryToAdd.date = entryToAdd.date.toISOString().substring(0, 10);
                groceryService.groceryItems.push(entryToAdd);
            }
    };




    groceryService.removeItem =function (entryToDelete) {

        $http.post("data/updated_item.json",{id:entryToDelete.id})
            .success(function (data) {
                if(data.status==1)
                {
                    var index = groceryService.groceryItems.indexOf(entryToDelete);
                    groceryService.groceryItems.splice(index,1);

                }

            })
            .error(function (data,status) {

            });
        };


    groceryService.markCompleted = function (entryToMark) {

            entryToMark.completed = !entryToMark.completed;

    }



    return groceryService;

});






app.controller("HomeController", ["$scope","GroceryService",function($scope,GroceryService) {
    $scope.appTitle = "Grocery List";
    $scope.groceryItems = GroceryService.groceryItems;


    $scope.removeItem = function (entry) {
        GroceryService.removeItem(entry);
    };


    $scope.markCompleted = function (entry) {
        GroceryService.markCompleted(entry);
    };


    $scope.$watch(function () {return GroceryService.groceryItems;}, function (groceryItems) {
      $scope.groceryItems=   groceryItems;
    })

}]);

app.controller("GroceryListItemsController", ["$scope","$routeParams","$location","GroceryService", function($scope,$routeParams,$location,GroceryService){

   if(!$routeParams.id){
       $scope.groceryItem = { id:0, completed:false, itemName:"", date: "2016-10-02"}
   }
    else
   {
       $scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
   }


    $scope.groceryItems = GroceryService.groceryItems;




    $scope.save = function () {
        GroceryService.save($scope.groceryItem);
        $location.path("/");
    }




}]);


app.directive("tbGroceryItem", function () {
    return {
        restrict:"E",
        templateUrl:"views/groceryItem.html"
    }
})