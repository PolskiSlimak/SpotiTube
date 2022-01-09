import {animation, trigger, animateChild, group, state, transition, animate, style, query} from '@angular/animations';

export const Animations = {
  buttonSize: trigger('buttonSize', [
    state('true', style({
        color: 'black',
      })
    ),
    state('false', style({
        color: 'white',
      })
    ),
    transition('true => false', [
      animate('0.02s')
    ]),
    transition('false => true', [
      animate('0.02s')
    ]),
  ]),

};
