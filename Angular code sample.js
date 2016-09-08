unomyGeneralServices.factory('$unomyUserService', ['$q', '$rootScope', '$filter', '$eventList', 'Restangular', 'Restangular_v2', function ($q, $rootScope, $filter, $eventList, Restangular, Restangular_v2) {
    'use strict';
    var userCollection = {};

    var $unomyUserService = {
        getUser: function (userId, force, eventName) {
            var deferred = $q.defer();

            if (userCollection[userId] && !force) {
                deferred.resolve(userCollection[userId]);
            } else {
                Restangular
                    .one('users', userId)
                    .get()
                    .then(function (result) {
                        userCollection[userId] = result;
                        deferred.resolve(userCollection[userId]);
                    }, function (error) {
                        deferred.reject(error);
                    });

                if (eventName) {
                    $rootScope.$broadcast(eventName);
                }
            }

            return deferred.promise;
        },

        getMe: function () {
            return Restangular
                .one('users', 'me')
                .get()
                .then(function (result) {
                    userCollection[result.id] = result;
                    $rootScope.currentUser = result;
                    $rootScope.currentUser.current_password = '';
                    $rootScope.currentUser.new_password = '';
                    $rootScope.currentUser.new_password_repeat = '';
                    $unomyUserService.getContactsViewLimit();
                });
        },

        deleteUserImage: function (userId) {
            return Restangular
                .one('users', userId)
                .one('images')
                .remove()
                .then(function () {
                    delete userCollection[userId];
                    $rootScope.$broadcast($eventList.USER_IMAGE_DELETED);
                });
        },

        searchUserTag : function (tagName) {
            return Restangular
                .all('user')
                .all('search')
                .all('tag')
                .getList({
                    q: tagName
                });
        },
        
        getContactsViewLimit : function () {
            return Restangular_v2
                .all('person')
                .all('limit')
                .getList()
                .then(function(data) {
                    $rootScope.currentUser.leftContacts = data.left;               
                    $rootScope.currentUser.totalContacts = data.total;
                    return data;
                });
        }
    };

    return $unomyUserService;
}]);