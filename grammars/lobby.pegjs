start
  = helpCommand
  / startCommand
  / fail
  / sayCommand

helpCommand
  = '/' ('help' / '?') !.+ { return { type: 'help' } }

startCommand
  = '/start' (_ value:.+)? !.+ { return { type:'start' } }

sayCommand
  = !'/' value:.+ { return { type: 'say', value: value.join('') } }



word
  = letters:[a-zA-Z-]+ { return letters.join(''); }

_
  = [ ]+

fail
  = '/' string:.+ { return { error: true, type: 'unknown', message: 'Unrecognized command: ' + string.join('') }; }