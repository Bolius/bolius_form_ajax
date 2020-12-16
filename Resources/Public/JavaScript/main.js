
// IF FormData and fetch are not supported, abandon ship!

const BoliusFormAjax = function(contentElementId){

    const formCE = document.getElementById('c' + contentElementId);
    const form = formCE.querySelector('form');
    const loadingClass = 'loading-form';

    let temp = document.createElement('div'); // This should be a template
    document.body.append(temp);

    const _disableBackBtn = (function(prevElm){
        if(!prevElm) return;

        // This is entirely too dependant on markup :(
        // const prevHiddenInput = prevElm.querySelector('input[type="hidden"]');
        const backBtn = prevElm.querySelector('button');

        backBtn.removeAttribute('onclick');
        // backBtn.name = prevHiddenInput.name;
        // backBtn.value = prevHiddenInput.value;
        //
        // prevHiddenInput.remove();

        backBtn.addEventListener('click', function(e){
            // e.preventDefault();
            // debugger;
            // form.submit();
            const domEvent = document.createEvent('Event');
            domEvent.initEvent('submit', false, true);
            e.target.closest('form').dispatchEvent(domEvent);
        })

    })(form.querySelector('.previous'));

    const _hijaxFormSubmit = function(e){
        e.preventDefault();

        const submitterBtn = e.submitter;

        formCE.classList.add(loadingClass);

        const data = new FormData(this);

        if(submitterBtn){
            data.append(submitterBtn.name, submitterBtn.value);
        }

        let url = e.target.action.split('?');
        url.splice(1, 0, '?type=1000&'); // Add type 1000 to url. PAGE with typeNum=1000 required

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

            // Empty the temp element

            // Rerun ajax form??
            BoliusFormAjax(501164);
        }).catch( e => {
            // Log error in console
            console.log(e)
        });

    };

    form.addEventListener('submit', _hijaxFormSubmit, { once : true });
}


BoliusFormAjax(501164)