
function SocialsClass() {
    this.socialList = null;
    this.scopeList = null;
    this.social = null;
    this.needsocialListUpdate = false;
    this.needsocialUpdate = false;
}

/**
 * Check whether socialList is downloaded or not.
 */
SocialsClass.prototype.isSocialListDownloaded = function () {
    return !!this.socialList;
};

SocialsClass.prototype.isScopeListDownloaded = function () {
    return !!this.scopeList;
};

SocialsClass.prototype.downloadSocials = function(paramsObj, callback) {
    var lat = 61.784403, lng = 34.344882, radius = 7, categoryId = 3;

    $(paramsObj).each(function (idx, value) {
        if (value.name === 'category_id') {
            categoryId = value.value;
        }
    });

    /*    var locationCondition = (
     (typeof lat !== 'undefined' && lat != null && lat !== '') &&
     (typeof lng !== 'undefined' && lng != null && lng !== '') &&
     (typeof radius !== 'undefined' && radius != null && radius !== '')
     );*/

    /*    var categoryCondition = typeof categoryId !== 'undefined' &&
     categoryId != null &&
     categoryId != -1;*/

    /*    if (!locationCondition && !categoryCondition) {
     throw new GetsWebClientException('Points Error', 'downLoadPoints, request parameters are incorrect.');
     }*/


    var scopes = "";
    var socialsList = [];
    var scopeList = [];
    var self = this;
    $.ajax({
        type: 'GET',
        url: 'http://ds-karelia.opti-soft.ru/api/getListScopes',
        dataType: 'jsonp',
        success: function (scopeData) {
            for (var i in scopeData) {
                var opt = document.createElement("option");
                opt.innerHTML = scopeData[i].Name;
                opt.value = scopeData[i].Id;
                scopes += "&scopes=" + opt.value;
                scopeList[i] = {
                    id: scopeData[i].Id,
                    name: scopeData[i].Name
                };
            }
            self.scopeList = scopeList;

            $.ajax({
                type: 'GET',
                url: 'http://ds-karelia.opti-soft.ru/api/getPassports?latitude=' + lat + '&longitude=' + lng + scopes + '&radius=' + radius + '&onlyAgreed=false',
                dataType: 'jsonp',
                success: function (data) {
                    for (var i in data) {
                        var imgUrl;
                        if (data[i].Accessibility[categoryId - 1].Categorie.Id == categoryId && data[i].Accessibility[categoryId - 1].MaintenanceForm)
                            switch (data[i].Accessibility[categoryId - 1].MaintenanceForm.Id) {
                                // mother of god
                                case 0:
                                    imgUrl = ICONS_FOLDER + 'ic_location_green.png';
                                    break;
                                case 1:
                                    imgUrl = ICONS_FOLDER + 'ic_location_yellow.png';
                                    break;
                                case 2:
                                    imgUrl = ICONS_FOLDER + 'ic_location_red.png';
                                    break;
                                case 3:
                                    imgUrl = ICONS_FOLDER + 'ic_location_gray.png';
                                    break;
                                default:
                                    continue;
                            }

                        var access = data[i].Accessibility;
                        var accessRelations = [];

                        for (var l in access)
                            if (access[l].Categorie.Id != null && access[l].MaintenanceForm != null)
                                accessRelations[access[l].Categorie.Id] = access[l].MaintenanceForm.Id;

                        socialsList[i] = {
                            coordinates: data[i].Latitude + "," + data[i].Longitude,
                            // our internal uuid ¯\_(ツ)_/¯
                            uuid: i,
                            title: data[i].Name,
                            route: data[i].Route,
                            address: data[i].Address,
                            objectName: data[i].ObjectName,
                            icon: imgUrl,
                            access: access,
                            accessRelations: accessRelations,
                            scopes: data[i].Scopes
                        };
                    }
                    self.socialList = socialsList;
                    if (callback) {
                        callback();
                    }
                },
                error: function () {
                    alert('error');
                }
            });
        },
        error: function () {
            alert('error');
        }
    });


};
function getAccessString(accessibility, categoryId) {
    var access = "";
    for (var j in accessibility)
    {
        if(accessibility[j].Categorie.Id == categoryId)
            access += '<div>';
        else
            access += '<div class = invisibleAccessibility>';
        if (accessibility[j].Categorie)
            access += '<br><div align="center"><b>' + accessibility[j].Categorie.Name + '</b></b></div>';
        if (accessibility[j].MaintenanceForm)
            access += '<div align="center"><i>' + accessibility[j].MaintenanceForm.Name + '</i></div><br>';
        for (var k in accessibility[j].FunctionalAreas)
        {
            access += '<div align="left">' + accessibility[j].FunctionalAreas[k].FunctionalArea.Name + ' - ' +
            accessibility[j].FunctionalAreas[k].Type.Name + '</div>';
        }
        access += '</div>';
    }
    return access;
}
SocialsClass.prototype.findSocialInsocialList = function(uuid) {
    if (!uuid || !this.socialList) {
        return;
    }
    for (var i = 0, len = this.socialList.length; i < len; i++) {
        if (this.socialList[i].uuid.trim() === uuid.trim()) {
            this.social = this.socialList[i];
            return this.social;
        }
    }
};

/**
 * Getters
 */
SocialsClass.prototype.getSocialList = function() {
    if (this.isSocialListDownloaded()) {
        return this.socialList;
    }
};

SocialsClass.prototype.getScopeList = function() {
    if (this.isScopeListDownloaded()) {
        return this.scopeList;
    }
};

SocialsClass.prototype.getSocial = function() {
    if (!this.social) {
        throw new GetsWebClientException('socials Error', 'getsocial, social undefined or null');
    }
    return this.social;
};

SocialsClass.prototype.setSocial = function(social) {
    this.social = social;
};