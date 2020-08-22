import React from 'react'
import propTypes from 'prop-types'
import styles from './mapsViewer.module.css'
import Card from 'react-bootstrap/Card'

const MapsViewer = ({
  pavlovMaps,
  switchMap,
}) => {
  return <>
   {pavlovMaps.map(pavlovMap => {      

    const onClick = () => switchMap(pavlovMap.id)
    return (
      <Card
        className={styles['map-tile']}
        key={pavlovMap.id}
      >
       
        {!pavlovMap.imgSrc &&
          <div
            className={styles['alt-thumbnail']}
            onClick={onClick}
          >
            {pavlovMap.title}
          </div>
        }
        {pavlovMap.imgSrc &&
          <Card.Img
            variant="top"
            className={styles.thumbnail}
            src={[pavlovMap.imgSrc]}
            alt={pavlovMap.title}
            onClick={onClick} />
        }
        <Card.Body>
          <Card.Title>{pavlovMap.title}</Card.Title>
         </Card.Body>
      </Card>
    )
    })}

  </>
}

MapsViewer.propTypes = {
  pavlovMaps: propTypes.array.isRequired,
  switchMap: propTypes.func.isRequired,
}

export default MapsViewer