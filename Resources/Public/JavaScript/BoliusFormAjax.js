/**
 * Simple ajax submit
 * @param formIdentifier
 * @return {{refresh: refresh}}
 * @constructor
 */
const BoliusAjaxForm = function(formIdentifier){

    if(typeof fetch !== 'function' || typeof FormData !== 'function') return;

    // Form identifier looks like this xx-123, where 123 is the id of the content element.
    const identifier = formIdentifier.split('-');
    const contentElementId = parseInt(identifier[1]);

    const formCE = document.getElementById('c' + contentElementId);
    if(!formCE) return;

    const loadingClass = 'loading-form';

    // Create a landing/target div for content coming in dynamically
    let form = formCE.querySelector('form');
    let temp = document.createElement('div'); // This should be a template

    const _init = function(){

        document.body.append(temp);

        // Append loading,
        // TODO: refactor into own function?
        const loader = document.createElement('div');
        loader.classList.add('loader');
        formCE.append(loader);

        _disableBackBtn(form.querySelector('.previous'));

        form.addEventListener('submit', _hijaxFormSubmit);
    };

    const refresh = function(){
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
     * @param form
     * @private
     */
    const _emitEvent = function(form){
        const event = new Event('reload');
        console.log('Emitting an event', event);
        form.addEventListener('reload', function (e) {
            // debugger;
            console.log(e);
        }, false);
        form.dispatchEvent(event);

        // TODO: What element do we emit this event on?
        // Where do we grap the event?
        // Should form utils be rewritten so it doesn't depend on url? (YES)
    };

    /**
     * Hijax the form submit
     * @param e form submit event
     * @private
     */
    const _hijaxFormSubmit = function(e){
        const submitterBtn = e.submitter;

        if(submitterBtn &&
            submitterBtn.parentElement &&
            submitterBtn.parentElement.classList.contains('submit')) return;

        e.preventDefault();

        formCE.classList.add(loadingClass);

        const data = new FormData(this);

        if(submitterBtn){
            data.append(submitterBtn.name, submitterBtn.value);
        }

        // Send content element id with tha form request
        data.append('form_ce_uid', contentElementId);

        // Build the fetch url
        let url = e.target.action.split('?');
        // url.splice(1, 0, '?type=1000&'); // Add type 1000 to url. PAGE with typeNum=1000 required
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

            // Stop loading animation
            formCE.classList.remove(loadingClass);

            // Put html response inside hidden temp element
            temp.innerHTML = html;

            // Find the form part of the html
            const tempForm = temp.querySelector('#' + form.id); // Dublicate id??!?!?

            // Put the form part inside the current form
            form.innerHTML = tempForm.innerHTML;

            _emitEvent(form);

            // Empty the temp element
            refresh();
        }).catch( e => {
            // Log error in console
            console.log(e)
        });

    };

    _init();

    return {
        refresh
    };
}