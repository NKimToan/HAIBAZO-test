import './App.css';
import {useState, useEffect, useRef} from "react";


function App() {

  const [point, setPoint] = useState(5);
  const [circles, setCircles] = useState([]);
  const [countTime, setCountTime] = useState(0);
  const [idPoint, setIdPoint] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [nextPoint, setNextPoint] = useState(1);
  const [isHideNextPoint, setIsHideNextPoint] = useState(true);
  const [intervals, setIntervals] = useState([]);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const timeRef = useRef();

// Random position of points in zone
  const generateRandomPosition = () => {
    const sizeWidth = 530; 
    const sizeHeight = 450;
    return {
      x: Math.random() * (sizeWidth - 50),
      y: Math.random() * (sizeHeight - 50),
    };
  };
// Handle form when press button play or restart
  const handlePlay = (e) => {
    e.preventDefault();
    setIsPlaying(false);
    const pointValue = e.target.point.value;
    if (pointValue <= 0) {
      setPoint(5)
    } else {
      setPoint(pointValue);
    }

    // Reset timeRef when pressing restart
    if (timeRef.current) {
      clearInterval(timeRef.current);
    }

    setTimeout(() => {
      setIsHideNextPoint(false);
      setIsAutoPlay(false);
      setIsPlaying(true);
      setIsFailed(false);
      setIsSuccess(false);
      setNextPoint(1);
      setCountTime(0);
      timeRef.current = setInterval(() => {
        setCountTime(prevCount => prevCount + 1);
      }, 100)
    }, 0)
  }
  // Handle when press on point in zone game
  const handlePoints = (id) => {
    
    if (!isFailed && !isSuccess) {
      if (!idPoint.includes(id)) {
        setNextPoint(id + 1);

        // Add id into idPoint as soon as press point
        setIdPoint((prevPoint) => {
          const updatedPoints = [...prevPoint, id];
          // Case GAME OVER
          if (id !== updatedPoints.length) {
            setIsFailed(true);
            setIsPlaying(false);
            setIsHideNextPoint(true);
          }
          // Case ALL CLEARED
          if (id === Number(point) && updatedPoints.length === Number(point)) {
            setIsHideNextPoint(true);
            setIntervals([]);
            setTimeout(() => {
              setIsSuccess(true);
              setIsPlaying(false);
            }, 3000)
          }

          return updatedPoints;
        });
      }
    }
    
    // Decrease time of point (interval) when that point is clicked
    const interval = setInterval(() => {
      setCircles((prevCircles) =>
        prevCircles.map((circle) =>
          circle.id === id
            ? 
            { ...circle, time: Math.max(0, circle.time - 0.1) }
            : circle
        )
      );
    }, 100);

    // Save interval (key time) for a element in circles
    setIntervals((prevIntervals) => [...prevIntervals, interval]);
    
    // Stop count when time of point after 3 seconds 
    setTimeout(() => {
      clearInterval(interval);
    }, 3000)
  }

  // Re-render zone game when isPlaying state change or change the num of point
  useEffect(() => {
    if (isPlaying) {
      const newCircles = [];
      for (let i = 1; i <= point; ++i) {
        const position = generateRandomPosition();
        newCircles.push({ id: i, ...position, time: 3});
      }
      setCircles(newCircles);
      setIdPoint([]);
    }
  }, [point, isPlaying]);

  useEffect(() => {
    // Stop countTime when isFailed or isSuccess change to true
    if (isFailed || isSuccess) {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = null;
      }
    }
    
    // Stop time of point when isFailed is true
    if (isFailed && !isSuccess) {
      intervals.forEach((interval) => clearInterval(interval));
      setIntervals([]);
    }
  }, [isFailed, isSuccess]);

  // Mode auto play
  useEffect(() => {
    let timeouts = [];
    
    if (isAutoPlay && !isFailed && !isSuccess) {
      for (let i = idPoint.length+1; i <= point; ++i) {
        const timeout = setTimeout(() => {
          handlePoints(i);
        }, (i-idPoint.length)*1000) // Settings time call function handlePoints()
        timeouts.push(timeout);
      }
    }
    
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts = [];
    };
  }, [isAutoPlay])

  return (
    <div className="App container-fluid">
      <div className="box">
          <header className="box-header">
            {isFailed === false  ?
            <>
              { isSuccess === false ?
                <h3 className="box-header-title">LET'S PLAY</h3>
                :
                <h3 className="box-header-title text-success">ALL CLEARED</h3>
              }
              </>
              :
              <h3 className="box-header-title text-danger">GAME OVER</h3>
            }
            <form className="box-header-form" onSubmit={handlePlay}>
              <div className="point">
                <label htmlFor="point" className="point-label">Points:</label>
                <input 
                  type="number" 
                  name="point" 
                  className="point-input" 
                  placeholder={point} 
                  value={point}
                  onChange={(e) => (!isPlaying || isSuccess || isFailed) ? setPoint(e.target.value) : setPoint(point)}
                />
              </div>
              <div className="time">
                <div className="time-title">Time:</div>
                <div className="time-count">
                  {countTime === 0 ? "0.0" : 
                    countTime%10 === 0 ?  `${countTime/10}.0` : countTime/10
                  }s
                </div>
              </div>
              <div className="button mt-3">
                {isPlaying || isSuccess || isFailed ?
                  <div className="playing">
                    <button className="button-restart btn-outline-secondary" type="submit">Restart</button>
                    {isSuccess || isFailed ?
                      <></>
                      :
                      <button 
                      className="ms-2 button-auto btn-outline-secondary" 
                      type="button"
                      onClick={() => setIsAutoPlay(!isAutoPlay)}>
                          Auto Play {isAutoPlay ? "OFF" : "ON"}
                      </button>
                    }
                  </div>
                  :
                  <div className="play">
                    <button className="button-play btn-outline-secondary" type='submit'>Play</button>
                  </div>
                }
              </div>
            </form>
          </header>
          <div className="box-body">
            <div className="zone">
            {circles.map((circle) => (
              <div
                  key={circle.id}
                  className={idPoint.includes(circle.id) ? "point-round checked" : "point-round"}
                  style={{
                    top: `${circle.y}px`,
                    left: `${circle.x}px`,
                    opacity: circle.time > 0 ? circle.time/3 : 0,
                    transition: "opacity 0.1s linear"
                  }}
                  onClick={() => {!isAutoPlay && handlePoints(circle.id)}}
                >
                {!idPoint.includes(circle.id) ? 
                  circle.id 
                  : 
                  <div className="checked-point">
                    <span>{circle.id}</span>
                    <span className="checked-time">{circle.time.toFixed(1)}s</span>
                  </div>
                }
              </div>
              ))}
            </div>
          </div>
          <footer className="box-footer">
            {(!isHideNextPoint) ?
            <div className="next">Next: {nextPoint}</div>
            :
            <></>
            }
          </footer>
      </div>
    </div>
  );
}

export default App;
