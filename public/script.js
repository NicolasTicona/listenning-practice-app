import { PageState, injector, ListennigState, WelcomeState } from "./pages-state.js";

const pageState = new PageState();
pageState.init();

if (localStorage.getItem("stories")) {
    pageState.change(injector.get(ListennigState));
}

console.log(pageState.currentState);

document.addEventListener('changeState', function (event) {
  switch(event.detail?.newState) {
    case 'listenning':
      pageState.change(injector.get(ListennigState));
      break;

    default:
      pageState.change(injector.get(WelcomeState));
  }
});