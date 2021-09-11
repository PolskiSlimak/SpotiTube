import {animation, trigger, animateChild, group, state, transition, animate, style, query} from '@angular/animations';

export const Animations = {
  buttonSize: trigger('buttonSize', [
    state('true', style({
        padding: '{{padding}}rem',
        fontSize: '{{fontSize}}rem',
      }), {
        params: {
          padding: '1.5',
          fontSize: '1.65',
        }
      }
    ),
    state('false', style({
        padding: '{{padding}}rem',
        fontSize: '{{fontSize}}rem',
      }), {
        params: {
          padding: '1.25',
          fontSize: '1.60',
        }
      }
    ),
    transition('true => false', [
      animate('0.02s')
    ]),
    transition('false => true', [
      animate('0.02s')
    ]),
  ]),

};
