const x = require('hyperaxe');

const pseudoCheckbox = (checked) => {
    if (checked) {
        return x('div.pseudo-checkbox.pseudo-checked')(
            {disabled: true},
            x('i.fas.fa-check')()
        );
    } else {
        return x('div.pseudo-checkbox')({disabled: true});
    }
}

module.exports = pseudoCheckbox;