;(function(window, ko, undefined) {

    /////////// HELPER FUNCTIONS ///////////

    //full credit goes to http://johndyer.name/native-browser-get-set-properties-in-javascript/ (15.02.2013)
    // Super amazing, cross browser property function, based on http://thewikies.com/
    function addProperty(obj, name, onGet, onSet) {

        // wrapper functions
        var oldValue = obj[name], getFn = function() {
            return onGet.apply(obj, [oldValue]);
        }, setFn = function(newValue) {
            return oldValue = onSet.apply(obj, [newValue]);
        };

        // Modern browsers, IE9+, and IE8 (must be a DOM object),
        if (Object.defineProperty) {

            Object.defineProperty(obj, name, {
                get : getFn,
                set : setFn
            });

            // Older Mozilla
        } else if (obj.__defineGetter__) {

            obj.__defineGetter__(name, getFn);
            obj.__defineSetter__(name, setFn);

            // IE6-7
            // must be a real DOM object (to have attachEvent) and must be attached to document (for onpropertychange to fire)
        } else {

            var onPropertyChange = function(e) {

                if (event.propertyName == name) {
                    // temporarily remove the event so it doesn't fire again and create a loop
                    obj.detachEvent("onpropertychange", onPropertyChange);

                    // get the changed value, run it through the set function
                    var newValue = setFn(obj[name]);

                    // restore the get function
                    obj[name] = getFn;
                    obj[name].toString = getFn;

                    // restore the event
                    obj.attachEvent("onpropertychange", onPropertyChange);
                }
            };

            obj[name] = getFn;
            obj[name].toString = getFn;

            obj.attachEvent("onpropertychange", onPropertyChange);

        }
    };

    //full credit goes to http://stackoverflow.com/a/1955160 (17.02.2013)
    function getStyle(el, styleProp) {

        var camelize = function(str) {
            return str.replace(/\-(\w)/g, function(str, letter) {
                return letter.toUpperCase();
            });
        };

        if (el.currentStyle) {
            return el.currentStyle[camelize(styleProp)];
        } else if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        } else {
            return el.style[camelize(styleProp)];
        }
    };

    /////////// TRISTATE BOOLEAN ///////////

    var getValidTristateBooleanValue = function(val) {
        switch(typeof val) {
            case "boolean":
            case "undefined":
                return val;
                break;
            default:
                if (val === null) {
                    return undefined;
                } else {
                    return !!val;
                }
        }
    };

    var isTristateBoolean = function(_val) {
        return typeof _val === "function" && _val.__tristate__;
    };

    var unwrapTristateBoolean = function(bool, peek) {
        var b;
        if (peek && ko.isObservable(bool)) {
            b = bool.peek();
        } else {
            b = ko.utils.unwrapObservable(bool);
        }
        return isTristateBoolean(b) ? b() : b;
    }
    var triToState = {
        "true" : 1,
        "undefined" : 0.5,
        "false" : 0
    };

    var stateToTri = {
        "1" : true,
        "0.5" : undefined,
        "0" : false
    };

    var tristateBoolean = function(initialValue, defaultVal) {
        var _latestValHelper = initialValue;
        var _latestVal = function(peek) {
            if (!peek && !ko.isObservable(_latestValHelper)) {
                ko.dependencyDetection.registerDependency(tristate);
            }
            return getValidTristateBooleanValue(unwrapTristateBoolean(_latestValHelper, peek));
        };
        var _defaultValHelper = defaultVal;
        var _defaultVal = function(peek) {
            if (!peek && !ko.isObservable(_latestValHelper)) {
                ko.dependencyDetection.registerDependency(tristate);
            }
            return !!unwrapTristateBoolean(_defaultValHelper, peek);
        };

        function tristate() {
            if (arguments.length > 0) {
                //write
                if (ko.isObservable(_latestValHelper)) {
                    _latestValHelper(arguments[0]);
                } else if ((!tristate['equalityComparer']) || !tristate['equalityComparer'](_latestValHelper, arguments[0])) {
                    tristate.valueWillMutate();
                    _latestValHelper = arguments[0];
                    tristate.valueHasMutated();
                }
                return this;
            } else {
                //read
                return _latestVal();
            }
        };

        tristate.defaultValue = function() {
            if (arguments.length > 0) {
                //write
                if (ko.isObservable(_defaultValHelper)) {
                    _defaultValHelper(arguments[0])
                } else if ((!tristate['equalityComparer']) || !tristate['equalityComparer'](_defaultValHelper, arguments[0])) {
                    tristate.valueWillMutate();
                    _defaultValHelper = arguments[0];
                    tristate.valueHasMutated();
                }
                return this;
            } else {
                //read
                return _defaultVal();
            }
        };

        tristate.hasValue = function() {
            return typeof _latestVal() === "boolean";
        };

        tristate.getWithDefaultifNull = function() {
            //to make a valueChange event also happen when default is changed
            _defaultVal();

            return typeof _latestVal() === "boolean" ? _latestVal() : arguments.length ? !!unwrapTristateBoolean(arguments[0]) : _defaultVal();
        };

        tristate.__tristate__ = true;

        tristate.and = function(bool) {
            return stateToTri[Math.min(triToState[_latestVal()], triToState[getValidTristateBooleanValue(unwrapTristateBoolean(bool))])];
        };

        tristate.or = function(bool) {
            return stateToTri[Math.max(triToState[_latestVal()], triToState[getValidTristateBooleanValue(unwrapTristateBoolean(bool))])];
        };

        tristate.not = function() {
            return stateToTri[1 - triToState[_latestVal()]];
        }
        //immitate ko.observable behaviour
        ko.subscribable.call(tristate);

        tristate.peek = function() {
            return _latestVal(true);
        };
        tristate.valueHasMutated = function() {
            tristate["notifySubscribers"](_latestVal(true));
        }
        tristate.valueWillMutate = function() {
            tristate["notifySubscribers"](_latestVal(true), "beforeChange");
        }
        ko.utils.extend(tristate, ko.observable['fn']);

        ko.exportProperty(tristate, 'peek', tristate.peek);
        ko.exportProperty(tristate, "valueHasMutated", tristate.valueHasMutated);
        ko.exportProperty(tristate, "valueWillMutate", tristate.valueWillMutate);

        tristate[ko.observable.protoProperty] = tristateBoolean;

        return tristate;
    };
    
    tristateBoolean[ko.observable.protoProperty] = ko.observable;
    
    //exports

    ko["isTristateBoolean"] = isTristateBoolean;
    ko["utils"]["unwrapTristateBoolean"] = unwrapTristateBoolean;
    ko["utils"]["getValidTristateBooleanValue"] = getValidTristateBooleanValue;
    ko["tristateBoolean"] = tristateBoolean;

    /////////// TRISTATE INPUT ELEMENT CREATION ///////////

    createTristateCheckbox = function(element, fontSizeInitValue) {
        if (element.nodeType !== 1 || element.nodeName.toLowerCase() !== "input" || element.type !== "checkbox") {
            return false;
        }

        var cleanRegEx = /^, ?|, ?(?=,)|, ?$/gm;
        var elemBinding = element.getAttribute("data-bind") || "";
        var withBinding = elemBinding.match(/with ?: ?(?:[^\{][^,\s]*[^\}\s,]|\{(?:\S|\s)*\}) ?/g);
        elemBinding = elemBinding.replace(cleanRegEx, '');
        elemBinding = elemBinding.replace(/(text|html|foreach|if|ifnot|template) ?: ?(?:[^\{][^,\s]*[^\}\s,]|\{(?:\S|\s)*\}) ?/g, '');
        elemBinding = elemBinding.replace(cleanRegEx, '');
        var rewrittenElemBinding = elemBinding.replace(/(tristate|value|click|event|submit|enable|disable|hasfocus|checked|options|selectedOptions|uniqueName) ?: ?(?:[^\{][^,\s]*[^\}\s,]|\{(?:\S|\s)*\}) ?/g, '');
        rewrittenElemBinding = rewrittenElemBinding.replace(cleanRegEx, '');
        if (withBinding != null) {
            rewrittenElemBinding += (/^\s*$/.test(rewrittenElemBinding) ? '' : ', ') + withBinding[0];
        }

        var parent = element.parentNode;
        var tristateCont = document.createElement('span');
        tristateCont.setAttribute("class", "tristate-checkbox");
        rewrittenElemBinding && tristateCont.setAttribute("data-bind", rewrittenElemBinding);

        var tristateBox = document.createElement('span');
        tristateBox.setAttribute("class", "tristateBox");

        var overlay = document.createElement('span');
        overlay.setAttribute("class", "tristateOverlay");

        tristateBox.appendChild(overlay);
        tristateCont.appendChild(tristateBox);

        parent.replaceChild(tristateCont, element);

        tristateCont.insertBefore(element, tristateBox);

        if (elemBinding) {
            element.setAttribute("data-bind", elemBinding)
        } else {
            element.removeAttribute("data-bind")
        };

        var style = getStyle(overlay, 'font-size'), parsed;
        if (!style || !( parsed = parseFloat(style, 10)) || parsed < 1) {
            tristateCont.style.fontSize = fontSizeInitValue || "16px";
        }
        if(parsed && parsed < 8){
            tristateCont.style.fontSize = fontSizeInitValue || "8px";
        }
        style = getStyle(overlay, 'font-size');
        if(fontSizeInitValue && (!( parsed = parseFloat(style, 10))  || parsed < 8)){
            tristateCont.style.fontSize = "8px";
        }

        return true;
    }
    /////////// KNOCKOUT BINDINGHANDLER STUFF  ///////////

    /**
     *
     * <input type="checkbox" data-bind="tristate: someTristate" />
     *
     */

    var flipNext = {
        "undefined" : true,
        "false" : undefined,
        "true" : false
    };

    var initFunc = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var setAppropriateState = function() {
        };
        var fontSizeInitValue = ko.utils.unwrapObservable(allBindingsAccessor().tristateFontSize);
        var tristate = ko.computed({
            read : function() {
                return valueAccessor();
            },
            write : function(nv) {
                var _v = valueAccessor();
                _v(nv);
            },
            disposeWhenNodeIsRemoved : element
        });
        if (!ko.utils.domData.get(element, "isInited") && isTristateBoolean(tristate.peek()) && createTristateCheckbox(element, fontSizeInitValue)) {
            ko.utils.domData.set(element, "isInited", true);

            var flip = tristate.peek()();

            ( setAppropriateState = function(e) {
                if("___setState" in e){
                    flip = e.___setState;
                } else {
                    flip = flipNext[flip];
                }
                tristate.peek()(flip);
                switch(flip) {
                    case true:
                        element.setAttribute('checked', 'checked');
                        element.removeAttribute('tristate');
                        break;
                    case false:
                        element.removeAttribute('checked');
                        element.removeAttribute('tristate');
                        break;
                    case undefined:
                        element.setAttribute('tristate', 'tristate');
                        element.removeAttribute('checked');
                        break;
                }
                return true;
            })({
                ___setState : flip
            });

            tristate.subscribe(function(nv) {
                setAppropriateState({
                    ___setState : nv()
                })
            });

            ko.utils.registerEventHandler(element, 'change', setAppropriateState);

            addProperty(element, "tristate", function() {
                return tristate.peek();
            }, function(newTristate) {
                if (isTristateBoolean(newTristate)) {
                    tristate(newTristate);
                } else {
                    tristate.peek()(newTristate);
                }
            })
            addProperty(element, "checked", function() {
                return tristate.peek().getWithDefaultifNull();
            }, function(newValue) {
                tristate.peek()(newValue);
            });
            addProperty(element, "checkedAsTristate", function() {
                return tristate.peek();
            }, function(newValue) {
                tristate.peek()(newValue);
            });
        }
    }
    ko.bindingHandlers["tristate"] = {
        "init" : initFunc
    };

})(window, ko);