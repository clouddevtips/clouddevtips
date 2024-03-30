const anchorLinks = document.querySelectorAll('a[href*="#"]'); // Select all hash links

for (let item of anchorLinks) { // Loop through each link
    item.addEventListener('click', function (e) {
        let hashval = item.getAttribute('href');
        if (hashval && hashval.trim().length > 0 && hashval.trim() !== '#') {
            //remove everything before the hash
            hashval = hashval.substring(hashval.indexOf('#'));
            let target = document.querySelector(hashval);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, null, hashval);
                e.preventDefault();// Change the URL hash
            }
        }
    });
}

let actual_button = document.querySelectorAll('.wp-block-uagb-modal a');
if (actual_button.length > 0) {
    actual_button = actual_button.item(0);
    const modal_buttons = document.getElementsByClassName('open_astra_modal');
    for (let modal_button of modal_buttons) {
        modal_button.addEventListener('click', function () {
            actual_button.click();
        });
    }

    //function that calls the actual_button after 10 seconds of page load
    function call_button() {
        actual_button.click();
    }
    setTimeout(call_button, 15000);
}

//for all form.uagb-forms-main-form grab the submit event and prevent default behaviour
//send the form data to a custom endpoint

// Replace '#your-form-id' with the ID or class of your Spectra form
const forms = document.querySelectorAll('.uagb-forms-main-form');
//iterate through forms
forms.forEach(function (form) {
    //remove all events binded to the form
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission
        e.stopPropagation(); // Stop the event from bubbling up the DOM
        e.stopImmediatePropagation(); // Stop the event from bubbling up the DOM
        // Collect the form data
        //before building the form data we need to get the label of th input field
        //the html structure is like this:
        /**
         * <div class="wp-block-uagb-forms-name uagb-forms-name-wrap uagb-forms-field-set uagb-block-l70grx1y uag-col-2"><div class="uagb-forms-name-label required uagb-forms-input-label" id="l70grx1y">First Name</div><input type="text" placeholder="" required="" class="uagb-forms-name-input uagb-forms-input" name="l70grx1y" autocomplete="given-name" spellcheck="false" data-ms-editor="true"></div>
         */
        //from the name of the input field we can get the label of the input field
        //we can use the id of the label to get the label text
        //we can use the name of the input field to get the value of the input field

        const formData = new FormData(form);

        // Convert formData to a plain object
        let formObject = {};
        formData.forEach((field_value, field_name) => {
            //let's find the div inside the form which has the id=field_name
            let div = form.querySelector(`#${field_name}`);
            //let's get the html inside
            let label = div.innerHTML;
            formObject[field_name] = {
                label: label,
                value: field_value
            };
        });

        const email_body = Object.keys(formObject).reduce((acc, key) => {
            return acc + `<p>${formObject[key].label}: ${formObject[key].value}</p>`;
        }, '');

        // Send the data to your custom endpoint
        fetch('https://prod-250.westeurope.logic.azure.com:443/workflows/d3593789f36c4161b88b444f86b387ff/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZXA5t1wTNr6myGFZ6LkIVA4dA45JrML698o5_BBZlp4', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                body: email_body,
                to:'admin@betterlicenses.com',
                'subject': 'New form submission'
            }),
        }).then(response => {
                form.style.display = 'none';
                // Handle success - maybe show a message to the user
                //find the element inside the form which class starts with "uagb-forms-success-message"
                let success_message = form.parentElement.querySelector('[class^="uagb-forms-success-message"]');
                //remove the class uagb-forms-submit-message-hide
                success_message.classList.remove('uagb-forms-submit-message-hide');
                success_message.classList.add('uagb-forms-success-message');
            })
            .catch((error) => {
                // Handle errors here, such as displaying a notification
                form.style.display = 'none';
                let failed_message = form.parentElement.querySelector('[class^="uagb-forms-failed-message"]');
                //remove the class uagb-forms-submit-message-hide
                failed_message.classList.remove('uagb-forms-submit-message-hide');
                failed_message.classList.add('uagb-forms-failed-message');

            });
        return false;
    });
});
