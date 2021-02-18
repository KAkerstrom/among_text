const setupChatTemplate = () => {
  const chatDivTemplate = document.createElement('div');
  chatDivTemplate.className = 'ml-2 mr-2 mb-4';
  chatDivTemplate.style.backgroundColor = 'white';
  chatDivTemplate.style.borderRadius = '5px';
  chatDivTemplate.style.boxShadow = '4px 4px 2px black';
  chatDivTemplate.style.color = 'black';

  const imgElem = document.createElement('img');
  imgElem.style.float = 'left';
  imgElem.style.margin = '5px';
  imgElem.style.width = '64px';
  imgElem.style.height = '64px';
  chatDivTemplate.appendChild(imgElem);

  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'w-100 h-100';
  userMessageDiv.style.paddingLeft = '84px';
  chatDivTemplate.appendChild(userMessageDiv);

  const usernameElem = document.createElement('h5');
  usernameElem.className = 'chatName';
  userMessageDiv.appendChild(usernameElem);

  const messageElem = document.createElement('p');
  messageElem.style.overflowWrap = 'break-word';
  messageElem.style.marginRight = '5px';
  userMessageDiv.appendChild(messageElem);

  return chatDivTemplate;
};
const chatDivTemplate = setupChatTemplate();

const chatDiv = ({ img, username, message, imgSize }) => {
  const newChatDiv = chatDivTemplate.cloneNode(true);
  newChatDiv.childNodes[1].childNodes[0].innerText = username || '';
  newChatDiv.childNodes[1].childNodes[1].innerText = message || '';
  if (img) {
    newChatDiv.childNodes[0].src = img ? `img/${img}.png` : '';
    if (imgSize) {
      newChatDiv.childNodes[0].style.width = `${imgSize}px`;
      newChatDiv.childNodes[0].style.height = `${imgSize}px`;
      newChatDiv.childNodes[1].style.paddingLeft = `${imgSize + 20}px`;
    }
  } else {
    newChatDiv.childNodes[1].style.paddingLeft = '30px';
    newChatDiv.removeChild(newChatDiv.childNodes[0]);
  }

  return newChatDiv;
};
