<?php

$EM_CONF['bolius_form_ajax'] = [
    'title'        => 'AJAX forms',
    'description'  => 'Submit forms from ext:form using AJAX',
    'category'     => 'frontend',
    'author'       => 'Bolius Digital',
    'author_email' => 'web@bolius.dk',
    'state'        => 'beta',
    'version'      => '1.0.0',
    'constraints'  => [
        'depends'   => [
            'typo3' => '6.0.0-11.99.99',
            'form'  => '',
            'vhs'   => '5.2.0',
        ],
        'conflicts' => [],
        'suggests'  => [],
    ],
];