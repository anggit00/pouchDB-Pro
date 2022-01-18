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
});