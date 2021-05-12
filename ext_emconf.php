<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'AJAX forms',
    'description' => 'Submit forms from ext:form using AJAX',
    'category' => 'frontend',
    'author' => 'Bolius Digital',
    'author_email' => 'web@bolius.dk',
    'state' => 'beta',
    'uploadfolder' => 1,
    'createDirs' => '',
    'clearCacheOnLoad' => 0,
    'version' => '1.0.0',
    'constraints' => [
        'depends' => [
            'typo3' => '9.5.0-9.5.99',
            'form' => '',
            'vhs' => '5.2.0',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
