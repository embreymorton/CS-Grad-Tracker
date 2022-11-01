const x = require('hyperaxe');

const pseudoCheckbox = (checked) => {
    if (checked) {
        return x('input.pseudo-checkbox.pseudo-checked')(
            {disabled: true, type: "checkbox"},
            x('i.fas.fa-check')()
        );
    } else {
        return x('input.pseudo-checkbox')({disabled: true, type: "checkbox"});
    }
}

module.exports = pseudoCheckbox;