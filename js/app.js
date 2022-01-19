angular.module("pouchapp", [ui.router])

.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
        .state("list",{
            "url":"/list",
            "templateUrl":"templates/list.html",
            "controller" : "MainController"
        })
        .state("item",{
            "url":"/item/:documentId/:documentRevision",
            "templateUrl":"templates/list.html",
            "controller" : "MainController"
        });
        $urlRouterProvider.otherwise("list")
})

.run(function($pouchDB){
    $pouchDB.setDatabase("pouchdb-sample");
    $pouchDB.sync("http://localhost:4984/pouchdb-sample");
})

.controller("MainController", function($scope, $rootScope, $state, $stateParams, $pouchDB){
    $scope.item = {};

    $pouchDB.startListening();

    $rootScope.$on("$pouchDB:change", function(event, data){
        $scope.items[data.doc._id] = data.doc;
        $scope.$apply();
    });

    $rootScope.$on("$pouchDB:delete", function(event, data){
        delete $scope.items[data.doc._id]
        $scope.$apply();
    });

    if($stateParams.documentId){
        $pouchDB.get($stateParams.documentId).then(function(response){
            $scope.inputForm = response;
        });
    }

    $scope.save = function (firstname, lastmane, email){
        var jsonObject = {
            "firstname": firstname,
            "lastname": lastmane,
            "email": email
        }
        if ($stateParams.documentId){
            jsonDocument["_id"] = $stateParams.documentId;
            jsonDocument["_rev"] = $stateParams.documentRevision;
        }
        $pouchDB.save(jsonObject).then(function(response) {
            $state.go("list")
        }, function (error){
            console.log("ERROR ->" + JSON.stringify(error));
        });
    }

    $scope.delete = function (id, rev){
        $pouchDB.delete(id, rev)
    }

})

.service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {
    var database;
    var changeListener;

    this.setDatabase = function(databaseName){
        database = new PouchDB(databaseName);
    }

    this.stringListener = function(){
        changeListener = database.changes({
            live:true,
            include_doc:true
        }).on("change", function(change){
            if(!changes.deleted){
                $rootScope.$broadcast("$pouchDB:change",change);
            }else{
                $rootScope.$broadcast("$pouchDB:delete",change);
            }
        });
    }

    this.stopListening = function() {
        changesListener.cancel();
    }
    this.sync = function (remoteDatabase){
        database.sync(remoteDatabase, {live: true, retry: true});
    }
    this.save = function (jsonDocument){
        var deferred = $q.defer();
        if (!jsonDocument._id){
            database.post(jsonDocument).then(function(response){
                deferred.resolve(response);
            }).catch(function(error){
                deferred.reject(error)
            });
        }else{
            database.put(jsonDocument).then(function(response){
                deferred.resolve(response);
            }).catch(function(error){
                deferred.reject(error)
            });
        }
        return deferred.promise;
    }

    this.delete = function(documentId, documentRevision){
        return database.remove(documentId, documentRevision)
    }
    this.get = function(documentId){
        return database.get(documentId);
    }
    this.destroy = function (){
        database.destroy ();
    } 

}]);