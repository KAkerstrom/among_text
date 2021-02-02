start
  = helpCommand
  / goCommand
  / lookCommand
  / fail

helpCommand
  = ('help' / '?') { return { type: 'help' } }

goCommand
  = 'go' _ ('to' _)? ('the' _)? value:cardinal { return { type: 'go_cardinal', value } }
  / 'go' _ ('to' _)? ('the' _)? value:word (_ word)* { return { type: 'go_location', value } }
  / 'go' fail { return { error: true, type: 'go', message: 'Go where?' } }
  / value:cardinal { return { type: 'go_cardinal', value } }

lookCommand
  = 'look' { return { type: 'look', at: null }; }
  / 'look' _ 'at' _ value:word { return { type: 'look', value } }

sayCommand
  = 'say' _ value:.* { return { type: 'say', value } }



word
  = letters:[a-zA-Z-]+ { return letters.join(''); }

_
  = [ ]+

cardinal
  = dir:('north' / 'east' / 'west' / 'south') { return dir[0] }
  / 'n'
  / 'e'
  / 'w'
  / 's'

fail
  = string:.* { return { error: true, type: 'unknown', message: 'Unrecognized command: ' + string.join('') }; }