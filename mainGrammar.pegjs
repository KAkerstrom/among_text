start
  = helpCommand
  / lookCommand
  / waitCommand
  / ventCommand
  / killCommand
  / goCommand
  / sayCommand
  / fail

helpCommand
  = ('help' / '?') { return { type: 'help' } }

ventCommand
  = 'vent' _ ('in'? 'to' _)? value:word (_ word)* { return { type: 'go_location', value } }
  / ('go' / 'jump') _ (('in'? 'to'?)/'out of' _)? ('the'/'a' _)? 'vent' { return { type: 'vent' } } //todo: separate jumping into or out of the vent
  / 'vent' _ value:.+ { return {type: 'go_location', value} }
  / 'vent' fail:fail { return fail }
  / 'vent' { return { type: 'vent' } }

goCommand
  = 'go' _ ('to' _)? ('the' _)? value:cardinal { return { type: 'go_cardinal', value } }
  / 'go' _ ('to' _)? ('the' _)? value:word (_ word)* { return { type: 'go_location', value } }
  / 'go' _ fail { return { error: true, type: 'go', message: 'Go where?' } }
  / 'go' fail:fail { return fail }
  / 'go' !. { return { error: true, type: 'go', message: 'Go where?' } }
  / value:cardinal { return { type: 'go_cardinal', value } }

waitCommand
  = 'wait' !(.+) { return { type: 'wait' } }

lookCommand
  = 'look' { return { type: 'look', at: null }; }
  / 'look' _ 'at' _ value:word { return { type: 'look', value } }

sayCommand
  = 'say' _ value:.* { return { type: 'say', value: value.join('') } }

killCommand
  = 'kill' _ value:.+ { return { type:'kill', value: value.join('') } }
// reportCommand
// sabotogeCommand



word
  = letters:[a-zA-Z-]+ { return letters.join(''); }

_
  = [ ]+

cardinal
  = dir:('north' / 'east' / 'west' / 'south') ![a-zA-Z0-9] { return dir[0] }
  / dir:('n' / 'e' / 'w' / 's') ![a-zA-Z0-9] { return dir }

fail
  = string:.+ { return { error: true, type: 'unknown', message: 'Unrecognized command: ' + string.join('') }; }