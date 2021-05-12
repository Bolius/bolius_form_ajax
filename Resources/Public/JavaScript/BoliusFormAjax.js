/**
 * Simple ajax submit
 * @param formIdentifier
 * @return {}
 * @constructor
 */
if (typeof BoliusAjaxForm === 'undefined'){
    let BoliusAjaxForm;
}

BoliusAjaxForm = function(formIdentifier){

    if(typeof fetch !== 'function' || typeof FormData !== 'function') return;

    // Form identifier looks like this xx-123, where 123 is the id of the content element.
    const identifier = formIdentifier.split('-');
    const contentElementId = parseInt(identifier[1]);

    const formCE = document.getElementById('c' + contentElementId);
    if(!formCE) return;

    const loadingClass = 'loading-form';

    // Create a landing/target div for content coming in dynamically
    let form = formCE.querySelector('form');
    let temp = document.createElement('template');

    // All scripts on page that have src
    let scriptSrcs = [...document.querySelectorAll('script[src]')].filter(function(s){
        if(s.src !== 'undefined') return s.src;
    });

    const _init = function(){

        document.body.append(temp);

        // Append loading,
        // TODO: refactor into own function?
        const loader = document.createElement('div');
        loader.classList.add('loader');
        formCE.append(loader);

        _disableBackBtn(form.querySelector('.previous'));

        form.addEventListener('submit', _hijaxFormSubmit);
        // form.addEventListener('submit', _hijaxFormSubmit, {once: true});
    };

    const resetTempElement = function(){
        form = formCE.querySelector('form');

        _disableBackBtn(form.querySelector('.previous'));
    };

    /**
     * Disable back button
     * Find back button inside form and remove default onclick event
     *
     * @param prevElm
     * @private
     */
    const _disableBackBtn = function(prevElm){
        if(!prevElm) return;

        // This is entirely too dependant on markup :(
        const backBtn = prevElm.querySelector('button');

        backBtn.removeAttribute('onclick');

        backBtn.addEventListener('click', function(e){
            const domEvent = document.createEvent('Event');
            domEvent.initEvent('submit', false, true);
            e.target.closest('form').dispatchEvent(domEvent);
        })
    };

    /**
     * Emit an event for other scripts to use
     * @param eventName {String}
     * @param eventDetail {Object}
     * @private
     */
    const _emitEvent = function(eventName, eventDetail){
        let event;

        if(eventDetail){
            event = new CustomEvent(eventName, {
                detail: {
                    eventDetail
                }
            });
        } else {
            event = new Event(eventName);
        }

        form.dispatchEvent(event);
    };

    /**
     * Hijax the form submit
     * @param e form submit event
     * @private
     */
    const _hijaxFormSubmit = function(e){
        const submitterBtn = e.submitter;

        // Don't hijack the last step as it might need reloading for finishers
        if(submitterBtn &&
            submitterBtn.parentElement &&
            submitterBtn.parentElement.classList.contains('submit')) {

            // Emit an event when finishing the form
            _emitEvent('boliusFormAjax_formFinished');
            return;
        }

        e.preventDefault();

        // Add loading class while getting new page and refreshing
        formCE.classList.add(loadingClass);

        const data = new FormData(this);

        if(submitterBtn){
            data.append(submitterBtn.name, submitterBtn.value);
        }

        // Send content element id with tha form request
        data.append('form_ce_uid', contentElementId);

        // Build the fetch url
        let url = e.target.action.split('?');
        url.splice(1, 0, '?type=1610006384&'); // Add type 1000 to url. PAGE with typeNum=1000 required

        // Fetch
        fetch(url.join(''),{
            method: 'POST',
            body: data,
        })
        .then(response => {
            return response.text();
        })
        .then(html => {

            // Parse html response
            var parser = new DOMParser();
            doc = parser.parseFromString(html, "text/html");

            // Stop loading animation
            formCE.classList.remove(loadingClass);

            // Put html response inside hidden temp element
            temp.innerHTML = doc.body;

            // Find scripts from doc head
            let tempScripts = [...doc.querySelectorAll('script')];

            tempSrcScripts = []; // Src scripts
            tempInlineScripts = []; // Inline scripts (will be called when the last src script loads

            tempScripts.forEach( function(script){
                // Sort scripts into inline and external (src)
                // Don't include external scripts already loaded (see scriptSrcs)
                if(script.src.length > 0 && !scriptSrcs.includes(script.src)){
                    tempSrcScripts.push(script);
                } else if(script.src.length === 0) {
                    tempInlineScripts.push(script);
                }
            });

            form.innerHTML = doc.querySelector('#' + form.id).innerHTML;

            function loadScript(sScriptSrc, loadedCallback) {
                // console.log('loading: ' + sScriptSrc);
                var oHead = document.getElementsByTagName("HEAD")[0];
                var oScript = document.createElement('script');
                oScript.type = 'text/javascript';
                oScript.src = sScriptSrc;
                oHead.appendChild(oScript);
                oScript.onload = loadedCallback;
            }

            // Load external scripts
            if(tempSrcScripts.length > 0){
                (function callLoadScript(i){
                    loadScript(tempSrcScripts[i].src, function(){
                        // console.log('Finished loading: ' + tempSrcScripts[i].src);
                        if((i + 1) < tempSrcScripts.length){
                            callLoadScript(i + 1);
                        } else {
                            // If last, load inline scripts on load
                            tempInlineScripts.forEach( function(script){
                                // console.log('Load inline script');
                                const newScript = document.createElement('script');
                                newScript.innerHTML = script.innerHTML;
                                form.append(newScript);
                                script.remove();
                            });
                        }
                    });
                })(0);
            }

            // Emit an event after loading form
            _emitEvent('boliusFormAjax_formRefreshed', form);

            // Empty the temp element
            resetTempElement();

            // Focus inside top input element
            _focusInsideTopInputElement(form);
        }).catch( e => {
            // Log error in console
            console.log(e)
        });

    };

    const _focusInsideTopInputElement = function(form){

        const firstFormElm = form.querySelector('.form-control');
        firstFormElm.focus();
    }

    _init();

    return {

    };
}