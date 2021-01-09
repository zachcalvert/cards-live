import React, { useState } from "react";
import { useSocket } from "use-socketio";
import { ReactSVG } from 'react-svg'
import {Divider, Fab} from "@material-ui/core";
import './Opponent.css'
import {animated, useTrail} from "react-spring";

export const Opponent = (props) => {
  const [playableCards, setPlayableCards] = useState([]);
  const [playedCards, setPlayedCards] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const [scoringCards, setScoringCards] = useState([]);
  const [scoreDisplay, setScoreDisplay] = useState('');

  // dealt card animation
  const config = { mass: 5, tension: 2000, friction: 100 }
  const trail = useTrail(playableCards.length, {
    config,
    opacity: playableCards ? 1 : 1,
    x: playableCards ? 0 : 20,
    height: playableCards ? 20 : 0,
    from: { opacity: 1, x: 20, height: 0 },
  });

  useSocket("cards", msg => {
    if (props.name in msg.cards) {
      setPlayableCards(msg.cards[props.name]);
      setPlayedCards([]);
    }
    msg.show_to_all === true ? ( setShowCards(true)) : ( setShowCards(false))
  });

  useSocket("card_played", msg => {
    if (props.name === msg.player) {
      setPlayableCards(playableCards.filter(card => card !== msg.card));
      setPlayedCards([...playedCards, msg.card]);
    }
  });

  useSocket("display_score", msg => {
    if (props.name === msg.player) {
      setScoreDisplay(msg.text);
      setScoringCards(msg.cards);
    }
  });

  useSocket('send_turn', msg => {
    // setScoringCards([]);
  });

  const renderCards = () => {
    return playableCards.length ? (
      <div style={{'display': 'inline-flex'}}>
        {trail.map(({ x, height, ...rest }, index) => (
          <animated.div
            key={playableCards[index]}
            className="trails-text"
            style={{ ...rest, transform: x.interpolate(x => `translate3d(0,${x}px,0)`) }}>
            <animated.div style={{ height }}>
              <ReactSVG
                id={playableCards[index]}
                className={scoringCards.includes(playableCards[index]) ? 'active-opponent-card opponent-card': 'opponent-card' }
                key={index}
                wrapper='span'
                src={ showCards ? `/cards/${playableCards[index]}.svg` : `/cards/dark_blue.svg`}
              />
            </animated.div>
          </animated.div>
        ))}
      </div>
    ) : (
      <span />
    );
  };

  const renderPlayedCards = () => {
    return playedCards.length ? (
      <>
        {playedCards.map((card, index) => (
          <ReactSVG
            id={card}
            className='opponent-played-card'
            key={index}
            wrapper='span'
            src={`/cards/${card}.svg`}
          />
        ))}
      </>
    ) : (
      <span />
    );
  };

  return (
    <>
      <span>{ props.name }</span>
      <Divider className='opponent-divider' variant="middle" />
      { renderCards() }
      { renderPlayedCards() }
      {scoringCards ?
        (
          <>
          <br />
          <Fab variant="extended" className="opponent-action-button">
            { scoreDisplay }
          </Fab>
          </>
        ) : (<span/>)
      }
    </>
  );
}