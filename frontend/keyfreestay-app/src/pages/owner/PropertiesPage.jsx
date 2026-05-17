import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import PropertyCard from '../../components/PropertyCard'
import PrimaryButton from '../../components/PrimaryButton'
import { housingApi } from '../../api/client'
import { PageBg, PageInner } from '../../components/UI'

const TopRow = styled.div`
  display: flex; justify-content: flex-end; margin-bottom: 16px;
`
const Grid = styled.div`
  display: grid; gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 820px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`

export default function PropertiesPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    housingApi.list().then(r => setItems(r.items || [])).catch(() => {})
  }, [])

  return (
    <PageBg>
      <Header title="Мои объекты" />
      <PageInner>
        <TopRow>
          <PrimaryButton as={Link} to="/owner/p/new">＋ Добавить объект</PrimaryButton>
        </TopRow>
        <Grid className="reveal">
          {items.map(it => <PropertyCard key={it.id} item={it} variant="owner" />)}
        </Grid>
      </PageInner>
    </PageBg>
  )
}
