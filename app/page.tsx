'use client'
import { PokemonTCG } from 'pokemon-tcg-sdk-typescript';
import { useEffect, useRef, useState } from 'react';

import Card from './card';

let sortBy = "newest";
let searchTerm = "";
let pokemonList: string[] = [];
const maxCardsPerPage = 20;
let totalPages = 1;
let currentPageElement: HTMLSpanElement;

async function getPokemonData() {
  const apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=2000";

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${apiUrl}`);
    }

    let results = await response.json();
    pokemonList = results.results.map((obj: { name: string; }) => obj.name);

  } catch (error) {
    console.error(error);
    throw error;
  }
}

getPokemonData();

export default function Home() {
  const [searchCards, setSearchCards] = useState<PokemonTCG.Card[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [noCards, setNoCards] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchBar = useRef<HTMLInputElement | null>(null);
  const searchDropdown = useRef<HTMLUListElement | null>(null);
  const pagination = useRef<HTMLDivElement | null>(null);

  const handleSearchBarFocus = () => {
    setIsFocused(true);
  };

  useEffect(() => {
    const handleOutSideClick = (event: MouseEvent) => {
      if (!searchDropdown.current?.contains(event.target as Node) && !searchBar.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    window.addEventListener("mousedown", handleOutSideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [searchDropdown]);

  function createPagination(cardAmount:number) {
    setCurrentPage(1);
        totalPages = Math.ceil(cardAmount / maxCardsPerPage);

        if (totalPages !== 1) {
          for (let i = 1; i <= totalPages; i++) {
            const paginationText = document.createTextNode(i.toString());

            const paginationItem = document.createElement('span');


            if (i === 1) {
              currentPageElement = paginationItem;
              currentPageElement.className = 'cursor-pointer px-3 underline text-gray-500';
            } else {
              paginationItem.className = 'cursor-pointer px-3 hover:bg-gray-200';
            }

            paginationItem.onclick = (event) => {
              setCurrentPage(Number((event.target as HTMLElement).textContent!));
              currentPageElement.className = 'cursor-pointer px-3 hover:bg-gray-200';
              currentPageElement = (event.target as HTMLElement);
              currentPageElement.className = 'cursor-pointer px-3 underline text-gray-500';
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            };
            paginationItem.appendChild(paginationText);

            pagination.current?.appendChild(paginationItem);
          }
        }
  }

  function getCards() {
    PokemonTCG.findCardsByQueries({ q: 'name:"' + searchTerm + '"' }).then((cards: PokemonTCG.Card[]) => {
      if (pagination.current) {
        pagination.current.innerHTML = '';
      }

      if (cards.length === 0) {
        if (searchTerm.includes('-')) {
          searchTerm = searchTerm.replace('-', '. ');
          getCards();
        } else if (searchTerm.includes('. ')) {
          searchTerm = searchTerm.replace('. ', ' ');
          getCards();
        } else if (searchTerm.includes(' ')) {
          searchTerm = searchTerm.substring(0, searchTerm.indexOf(' '));
          getCards();
        }
        else {
          setSearchCards([]);
          setNoCards(true);
        }
      } else {
        setNoCards(false);
        createPagination(cards.length);
        setSearchCards(sortCards(cards));
      }
    })
      .catch(error => {
        console.error(error);
        throw error;
      });
  }

  function sortCards(cards: PokemonTCG.Card[]) {
    if (sortBy === "oldest" || sortBy === "newest") {
      cards.sort((a, b) => {
        const releaseDateA = new Date(a.set.releaseDate).getTime();
        const releaseDateB = new Date(b.set.releaseDate).getTime();
        if (sortBy === "oldest") {
          return releaseDateA - releaseDateB;
        } else {
          return releaseDateB - releaseDateA;
        }
      });
      return cards;
    } else if (sortBy === "highest price" || sortBy === "lowest price") {
      cards.sort((a, b) => {
        let highestA;
        let highestB;

        if (a.tcgplayer?.prices) {
          const marketA = a.tcgplayer?.prices.normal?.market || 0;
          const holofoilMarketA = a.tcgplayer?.prices.holofoil?.market || 0;
          const reverseHolofoilMarketA = a.tcgplayer?.prices.reverseHolofoil?.market || 0;

          highestA = marketA > holofoilMarketA ?
            (marketA > reverseHolofoilMarketA ? marketA : reverseHolofoilMarketA) :
            (holofoilMarketA > reverseHolofoilMarketA ? holofoilMarketA : reverseHolofoilMarketA);
        } else {
          highestA = 0;
        }

        if (b.tcgplayer?.prices) {
          const marketB = b.tcgplayer?.prices.normal?.market || 0;
          const holofoilMarketB = b.tcgplayer?.prices.holofoil?.market || 0;
          const reverseHolofoilMarketB = b.tcgplayer?.prices.reverseHolofoil?.market || 0;

          highestB = marketB > holofoilMarketB ?
            (marketB > reverseHolofoilMarketB ? marketB : reverseHolofoilMarketB) :
            (holofoilMarketB > reverseHolofoilMarketB ? holofoilMarketB : reverseHolofoilMarketB);
        } else {
          highestB = 0;
        }

        if (sortBy === "highest price") {
          return highestB - highestA;
        } else {
          return highestA - highestB;
        }
      });
      return cards;
    } else {
      return cards;
    }

  }

  function changeSearchTerm(searchString: string) {
    searchTerm = searchString;

    let suggestions = pokemonList.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (searchDropdown.current) {
      searchDropdown.current.innerHTML = '';
    }

    suggestions.forEach(suggestion => {
      const text = suggestion;
      const listItemText = document.createTextNode(text);

      const listItem = document.createElement('li');
      listItem.className = 'cursor-pointer px-3 hover:bg-gray-100';
      listItem.onclick = (event) => {
        if (searchBar.current && event.target) {
          searchBar.current.value = (event.target as HTMLElement).textContent!;
          changeSearchTerm(searchBar.current.value);
          setIsFocused(false);
          getCards();
        }
      };
      listItem.appendChild(listItemText);

      searchDropdown.current?.appendChild(listItem);
    });
  }

  function changeSortBy(sortByString: string) {
    sortBy = sortByString;
    setSearchCards(sortCards([...searchCards]));
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-3 py-3 sm:px-12 sm:py-12 lg:px-24">
      <div className="flex flex-col flex-wrap max-w-7xl lg:flex-row lg:justify-center text-black">
        <div className="flex mb-2 lg:mb-0">
          <div>
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <input
              className="block rounded-l-lg border border-gray-300 w-52 h-full px-3 py-2 outline-0 focus:border-gray-400 placeholder:text-gray-500 sm:w-80"
              placeholder="Search Pokemon"
              onChange={(event) => {
                changeSearchTerm(event.target.value);
              }}
              ref={searchBar}
              onFocus={handleSearchBarFocus}
            />
            <ul id="searchDropdown" className={`${!isFocused && 'hidden'} overflow-y-auto w-52 max-h-36 absolute bg-white sm:w-80`}
              ref={searchDropdown}>
            </ul>
          </div>
          <a
            className="text-nowrap font-semibold cursor-pointer rounded-r-lg border border-gray-300 px-5 py-2 bg-gray-100 transition-colors hover:border-gray-400 hover:bg-gray-200 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
            onClick={getCards}
          >
            Get Cards{" "}
          </a>
        </div>

        <div className="flex justify-center lg:ml-4">
          <label className='self-center pr-2' htmlFor="dropdown">Sort By:</label>
          <select id="dropdown" className='rounded-lg border border-gray-300 py-2 px-3 outline-0 focus:border-gray-400'
            onChange={(e) => {
              changeSortBy(e.target.value);
            }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest price">Highest Price</option>
            <option value="lowest price">Lowest Price</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center flex-wrap max-w-7xl">
        {noCards && <h2 className='py-10 text-2xl font-bold'>
          Card not found
        </h2>}
        {searchCards.slice((currentPage - 1) * maxCardsPerPage, (currentPage - 1) * maxCardsPerPage + maxCardsPerPage).map((card) => {
          if (card.tcgplayer?.prices) {
            return <Card key={card.id} imgURL={card.images.large}
              priceNormal={card.tcgplayer?.prices.normal?.market}
              priceHolofoil={card.tcgplayer?.prices.holofoil?.market}
              priceReverseHolofoil={card.tcgplayer?.prices.reverseHolofoil?.market} />;
          } else {
            return <Card key={card.id} imgURL={card.images.large}
              priceNormal={null}
              priceHolofoil={null}
              priceReverseHolofoil={null} />;
          }
        })}
      </div>

      <div className="flex justify-center flex-wrap max-w-7xl" ref={pagination}></div>
    </main>
  );
}
