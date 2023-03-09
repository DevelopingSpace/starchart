<?php
/*
  Specify user info for https://hub.docker.com/r/kristophjunge/test-saml-idp/ in the same format
  as our Seneca IdP will give it.  This is modeled on the original config here:
  https://github.com/kristophjunge/docker-test-saml-idp/blob/master/config/simplesamlphp/authsources.php
*/
$config = array(

    'admin' => array(
        'core:AdminPassword',
    ),

    'example-userpass' => array(
        'exampleauth:UserPass',
        'user1:user1pass' => array(
            /*
              NOTE: we add a bunch of claims that we expect to get back from Seneca,
              and need to simulate here.
            */
            'displayname' => 'Johannes Kepler', 
            'email' => 'user1@myseneca.ca',
            'sAMAccountName'=> 'user1',
            'group'=>'mycustomdomain-students',
        ),
        'user2:user2pass' => array(
            'displayname' => 'Galileo Galilei',
            'email' => 'user2@myseneca.ca',
            'sAMAccountName'=> 'user2',
            'group'=>'mycustomdomain-faculty',
        ),
        'user3:user3pass' => array(
          'displayname' => 'Adam Mason',
          'email' => 'user3@myseneca.ca',
          'sAMAccountName'=> 'user3',
          'group'=>'mycustomdomain-admins',
      ),
        'han.solo:starchart' => array(
          'displayname' => 'Hans Solo',
          'email' => 'hansolo@myseneca.ca',
          'sAMAccountName'=> 'han.solo',
          'group'=>'mycustomdomain-admins',
      ),
    ),

);
