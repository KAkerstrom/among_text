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
  / startCommand
  / voteCommand
  / skipCommand
  / changeColorCommand
  / pressButtonCommand
  / fail

helpCommand
  = ('help' / '?') end { return { type: 'help' } }

ventCommand
  = 'vent' _ ('in'? 'to' _)? value:word (_ word)* { return { type: 'go_location', value } }
  / ('go' / 'jump') _ (('in'? 'to'?)/'out of' _)? ('the'/'a' _)? 'vent' end { return { type: 'vent' } } //todo: separate jumping into or out of the vent
  / 'vent' _ value:.+ { return {type: 'go_location', value} }
  / 'vent' .+ { return { error: true, message: 'Unrecognized command.' } }
  / 'vent' end { return { type: 'vent' } }

goCommand
  = 'go' _ ('to' _)? ('the' _)? value:cardinal { return { type: 'go_cardinal', value } }
  / 'go' _ ('to' _)? ('the' _)? value:word (_ word)* { return { type: 'go_location', value } }
  / 'go' _ fail { return { error: true, type: 'go', message: 'Go where?' } }
  / 'go' !. { return { error: true, type: 'go', message: 'Go where?' } }
  / 'go' _ .* { return { error: true, message: 'Unrecognized location.' } }
  / value:cardinal { return { type: 'go_cardinal', value } }

waitCommand
  = 'wait' end { return { type: 'wait' } }

lookCommand
  = 'look' end { return { type: 'look', at: null }; }

sayCommand
  = 'say' _ value:.* { return { type: 'say', value: value.join('') } }

killCommand
  = 'kill' _ value:user end { return { type:'kill', value } }
  / 'kill' (_ word)+ end { return { error: true, message: 'You must specify a player (or colour) to kill.' } }
  / 'kill' end { return { error: true, type: 'kill', message: 'Kill whom?' } }

reportCommand
  = 'report' (_ .*)? end { return { type: 'report' } }

sabotageCommand
  = 'sabotage' _ ('the' _)? value:word { return { type: 'sabotage', value } }

taskCommand
  = task:task end { return task }

checkTasksCommand
  = ('check' _)? ('tasks'/('task' _ 'list')) end { return { type: 'check_tasks' } }

startCommand
  = 'start'_ 'game' end { return { type:'start' } }

voteCommand
  = 'vote' (_ 'for')? _ value:user { return { type:'vote', value } }
  / 'vote' (_ 'for')? (_ word)+ { return { error: true, message: 'Unrecognized name.' } }
  / 'vote' end { return { error: true, message: 'Vote for whom?' } }

skipCommand
  = 'skip' ((_ 'the')? _ 'vote')? end { return { type:'skip' } }

changeColorCommand
  = ('change' _)? 'colo' [u]? 'r' (_ 'to')? _ value:color end { return { type: 'change_color', value } }
  / ('change' _)? 'colo' [u]? 'r' (_ 'to')? (_ word)+ end { return { error: true, message: 'Invalid colour.' } }

pressButtonCommand
  = ('press'/'push'/('smash' _ 'that')) (_ 'the')? (_ 'emergency')? _ 'button' end { return { type: 'press_button' } }




word
  = letters:[a-zA-Z0-9-_]+ { return letters.join('') }

_
  = [ ]+

cardinal
  = dir:('north' / 'east' / 'west' / 'south') ![a-zA-Z0-9] { return dir[0] }
  / dir:('n' / 'e' / 'w' / 's') ![a-zA-Z0-9] { return dir }

user
  = x:$word &{ return options.usernames.indexOf(x) >= 0 } { return x }
  / x:$word &{ return options.usercolors.indexOf(x) >= 0 } { return options.usernames[options.usercolors.indexOf(x)] }

fail
  = string:.+ { return { error: true, type: 'unknown', message: 'Unrecognized command: ' + string.join('') }; }

end
  = _? !.



color
  = x:$word &{ return options.colors.indexOf(x) >= 0 } { return x }
  / 'lime' _ 'green' { return 'lime' }
  / ('navy' / 'dark') _ 'blue' { return 'blue' }
  / 'gr' [ae] 'y' { return 'black' }
  / 'light' _ 'blue' { return 'cyan' }

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
