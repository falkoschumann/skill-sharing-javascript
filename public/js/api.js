export async function getTalks() {
  const response = await fetch("/talks");
  return response.json();
}
