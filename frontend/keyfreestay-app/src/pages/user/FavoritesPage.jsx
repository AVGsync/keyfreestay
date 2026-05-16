import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import PropertyCard from '../../components/PropertyCard'
import { housingApi } from '../../api/client'
import { useFavorites } from '../../utils/favorites'
import { PageBg, PageInner, BackLink, PageTitle, Card } from '../../components/UI'

const Grid = styled.div`
  display: grid; gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 820px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`

export default function FavoritesPage() {
  const nav = useNavigate()
  const fav = useFavorites()
  const [items, setItems] = useState([])

  useEffect(() => {
    housingApi.list().then(r => setItems(r.items || [])).catch(() => {})
  }, [])

  const list = items.filter(i => fav.has(i.id))

  return (
    <PageBg>
      <Header title="Избранное" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <PageTitle style={{ marginBottom: 24 }}>Избранное ❤</PageTitle>
        {list.length === 0 && <Card>Список пуст. Добавьте объекты в избранное со страницы поиска.</Card>}
        <Grid>
          {list.map(it => (
            <PropertyCard key={it.id} item={it} variant="tenant" favorited onFavorite={fav.toggle} />
          ))}
        </Grid>
      </PageInner>
    </PageBg>
  )
}
