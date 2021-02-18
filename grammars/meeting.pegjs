start
  = helpCommand
  / voteCommand
  / skipCommand
  / accidental
  / fail
  / sayCommand

helpCommand
  = '/' ('help' / '?') !.+ { return { type: 'help' } }

voteCommand
  = '/vote' (_ 'for')? _ value:user { return { type:'vote', value } }
  / '/vote' (_ 'for')? (_ word)+ { return { error: true, message: 'Unrecognized name.' } }
  / '/vote' _? !. { return { error: true, message: 'Vote for whom?' } }

skipCommand
  = '/skip' (_ 'vote')? _? !.+ { return { type:'skip' } }

sayCommand
  = !'/' value:.+ { return { type: 'say', value: value.join('') } }

accidental
  = 'vote' .* { return { error: true, message: 'To vote, you must use use "/vote <player>".' } }
  / 'skip' .* { return { error: true, message: 'To skip the vote, you must use use "/skip".' } }



word
  = letters:[a-zA-Z0-9-_]+ { return letters.join(''); }

_
  = [ ]+

fail
  = '/' string:.+ { return { error: true, type: 'unknown', message: 'Unrecognized command: ' + string.join('') }; }

user
  = x:$word &{ return options.usernames.indexOf(x.toLowerCase()) >= 0 } { return x }
  / x:$word &{ return options.usercolors.indexOf(x.toLowerCase()) >= 0 } { return options.usernames[options.usercolors.indexOf(x.toLowerCase())] }