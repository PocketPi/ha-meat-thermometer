'use client'
import useSWR from 'swr'
 
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SystemInfo () {
  const { data, error, isLoading } = useSWR(`/api/v1/system/info`, fetcher)
 
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  console.log(data);
 
  return <div>hello {data.version}!</div>
}