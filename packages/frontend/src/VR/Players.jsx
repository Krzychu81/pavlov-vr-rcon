import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import IconButton from '../Layout/IconButton'
import Section from '../Layout/Section'
import Button from 'react-bootstrap/Button'

const logoFormatter = (src) => {
  if (!src) return null

  return <img src={src} alt="" style={{width: '160px'}}/>
}

const nickFormatter = (nick) => {
  return <span style={{fontSize: '2em'}}>{nick}</span>
}

const controlsFormatter = ({ switchTeam, switchTeamIcon }) => (id) => {
  return (
    <IconButton
      Icon={switchTeamIcon}
      label="Switch team"
      onClick={() => switchTeam(id)} 
    />
  )
}


const columns = ({ switchTeam, switchTeamIcon }) => ([
  {
    dataField: 'imgSrc',
    text: 'Logo',
    formatter: logoFormatter,
    headerStyle: () => {
      return { width: '180px' }
    }
  },
  {
    dataField: 'nick',
    text: 'Nick',
    sort: true,
    formatter: nickFormatter,
  },
  {
    text: 'Controls',
    dataField: 'id',
    formatter: controlsFormatter({ switchTeam, switchTeamIcon })
  }
])

const defaultSorted = [{
  dataField: 'nick',
  order: 'asc'
}]

const skins = [
  'clown', 'prisoner', 'naked', 'farmer', 'russian', 'nato'
]


const Players = ({ players, switchTeam, switchTeamIcon, title, setTeamSkin }) => {
  const options = React.useMemo(() => ({
    columns: columns({ switchTeam, switchTeamIcon })
  }), [ switchTeam,switchTeamIcon ])

  return (
    <Section title={title}>
      {skins.map(skinId => <>
      <Button as="input" type="button" value={skinId} onClick={() => setTeamSkin(skinId)} />{' '}
      </>)}
      <br /><br />
      { players &&
      <BootstrapTable 
        bootstrap4
        keyField='id' 
        data={ players } 
        columns={ options.columns } 
        defaultSorted={defaultSorted}
      />}
    </Section>
  )
}

export default Players
