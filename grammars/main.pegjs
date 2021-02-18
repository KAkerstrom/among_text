start
  = helpCommand
  / lookCommand
  / waitCommand
  / ventCommand
  / killCommand
  / goCommand
  / sayCommand
  / killCommand
  / sabotageCommand
  / reportCommand
  / taskCommand
  / checkTasksCommand
  / fail

helpCommand
  = ('help' / '?') !.+ { return { type: 'help' } }

ventCommand
  = 'vent' _ ('in'? 'to' _)? value:word (_ word)* { return { type: 'go_location', value } }
  / ('go' / 'jump') _ (('in'? 'to'?)/'out of' _)? ('the'/'a' _)? 'vent' !.+ { return { type: 'vent' } } //todo: separate jumping into or out of the vent
  / 'vent' _ value:.+ { return {type: 'go_location', value} }
  / 'vent' .+ { return { error: true, message: 'Unrecognized command.' } }
  / 'vent' { return { type: 'vent' } }

goCommand
  = 'go' _ ('to' _)? ('the' _)? value:cardinal { return { type: 'go_cardinal', value } }
  / 'go' _ ('to' _)? ('the' _)? value:word (_ word)* { return { type: 'go_location', value } }
  / 'go' _ fail { return { error: true, type: 'go', message: 'Go where?' } }
  / 'go' !. { return { error: true, type: 'go', message: 'Go where?' } }
  / 'go' _ .* { return { error: true, message: 'Unrecognized command.' } }
  / value:cardinal { return { type: 'go_cardinal', value } }

waitCommand
  = 'wait' !.+ { return { type: 'wait' } }

lookCommand
  = 'look' _? .* { return { type: 'look', at: null }; }

sayCommand
  = 'say' _ value:.* { return { type: 'say', value: value.join('') } }

killCommand
  = 'kill' _ value:user !. { return { type:'kill', value } }
  / 'kill' (_ word)+ !. { return { error: true, message: 'You must specify a player (or colour) to kill.' } }
  / 'kill' _? !. { return { error: true, type: 'kill', message: 'Kill whom?' } }

reportCommand
  = 'report' (_ .*)? !.+ { return { type: 'report' } }

sabotageCommand
  = 'sabotage' _ ('the' _)? value:word { return { type: 'sabotage', value } }

taskCommand
  = task:task _? !. { return task }

checkTasksCommand
  = ('check' _)? ('tasks'/('task' _ 'list')) _? !. { return { type: 'check_tasks' } }




word
  = letters:[a-zA-Z0-9-_]+ { return letters.join('') }

_
  = [ ]+

cardinal
  = dir:('north' / 'east' / 'west' / 'south') ![a-zA-Z0-9] { return dir[0] }
  / dir:('n' / 'e' / 'w' / 's') ![a-zA-Z0-9] { return dir }

user
  = x:$word &{ return options.usernames.indexOf(x.toLowerCase()) >= 0 } { return x }
  / x:$word &{ return options.usercolors.indexOf(x.toLowerCase()) >= 0 } { return options.usernames[options.usercolors.indexOf(x.toLowerCase())] }

fail
  = string:.+ { return { error: true, type: 'unknown', message: 'Unrecognized command: ' + string.join('') }; }





task
  = 'align' _ ('the' _)? 'engine' 's'? _ 'output'? { return { type: 'task', id: 'align_engine' } }
  / 'calibrate' _ ('the' _)? 'distributor' { return { type: 'task', id: 'calibrate_distributor' } }
  / 'chart' _ (('the'/'a') _)? 'course' { return { type: 'task', id: 'chart_course' } }
  / 'clean' _ ('the' _)? 'filter' { return { type: 'task', id: 'clean_filter' } }
  / 'clear' _ ('the' _)? 'asteroids' { return { type: 'task', id: 'clear_asteroids' } }
  / 'divert' _ ('the' _)? 'power' { return { type: 'task', id: 'divert_power' } }
  / 'accept' _ ('the' _)? ('diverted' _)? 'power' { return { type: 'task', id: 'accept_power' } }
  / 'empty' _ ('the' _)? (('trash'/'garbage') _)? 'chute' { return { type: 'task', id: 'empty_chute' } }
  / 'fix' _ ('the' _)? ('wiring'/'wires') { return { type: 'task', id: 'fix_wiring' } }
  / 're'? 'fill' _ ('the' _)? ('gas'/'petrol') (_ ('tank'/'canister'))? { return { type: 'task', id: 'fuel_engines' } }
  / ('fuel'/'fill') _ ('the' _)? 'reactor' { return { type: 'task', id: 'fuel_upper' } } // & fuel_lower
  / 'prepare' _ ('the' _)? 'samples' { return { type: 'task', id: 'prepare_samples' } }
  / 'inspect' _ ('the' _)? 'samples' { return { type: 'task', id: 'inspect_samples' } }
  / 'prime' _ ('the' _)? 'shields' { return { type: 'task', id: 'prime_shields' } }
  / 'stabilize' _ ('the' _)? 'steering' { return { type: 'task', id: 'stabilize_steering' } }
  / 'start' _ ('the' _)? 'reactor' { return { type: 'task', id: 'start_reactor' } }
  / ('submit' _)? ('a' _)? (('medbay'/'medical') _)? 'scan' { return { type: 'task', id: 'submit_scan' } }
  / 'swipe' _ ('the' _)? 'card' { return { type: 'task', id: 'swipe_card' } }
  / 'unlock' _ ('the' _)? 'manifolds' { return { type: 'task', id: 'unlock_manifolds' } }
  / 'download' (_ ('the' _)? 'data')? { return { type: 'task', id: 'download' } }
  / 'upload' (_ ('the' _)? 'data')? { return { type: 'task', id: 'upload' } }
