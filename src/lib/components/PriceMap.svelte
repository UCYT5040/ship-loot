<script lang="ts">
    import {onDestroy, onMount} from 'svelte';

    let {userId, itemId}: { userId: string, itemId: string } = $props();

    function getCombinedSeed(userId: string, itemId: string, hour: number): string {
        return `${userId}-${itemId}-${hour}`;
    }

    async function sha256(str: string): Promise<string> {
        const msgUint8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function getPriceAtHour(userId: string, itemId: string, hour: number): Promise<number> {
        const seed = getCombinedSeed(userId, itemId, hour);
        const hash = await sha256(seed);
        const subHash = hash.substring(0, 8);
        const intHash = parseInt(subHash, 16);
        return intHash / 0xffffffff;
    }

    async function generatePriceMap(userId: string, itemId: string): Promise<number[][]> {
        const priceMap: number[][] = [];
        const now = new Date();
        // In days since epoch
        const currentDay = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
        // In hours since epoch
        const dayHours = currentDay * 24;
        for (let day = 0; day < 4; day++) {
            const dayPrices: number[] = [];
            for (let hour = 0; hour < 24; hour++) {
                const currentHour = dayHours + (day * 24) + hour;
                const price = await getPriceAtHour(userId, itemId, currentHour);
                dayPrices.push(price);
            }
            priceMap.push(dayPrices);
        }
        return priceMap;
    }

    const cellWidth = 20; // Width of each cell in pixels
    const cellHeight = 40; // Height of each cell in pixels

    const rowPadding = 9; // Padding between rows

    const labelWidth = 50; // Width for the day labels
    const labelHeight = 40; // Height for the time labels

    const mapWidth = 24 * cellWidth + labelWidth; // 24 hours
    const mapHeight = 4 * (cellHeight + rowPadding) + rowPadding / 2 + labelHeight; // 4 days

    let currentTime = $state(new Date());
    let currentHour = $derived(currentTime.getTime() / (1000 * 60 * 60) % 24); // Current hour in the day

    let priceMap: number[][] = $state([]);

    let selectionX: number | null = $state(null); // Selected hour
    let selectionY: number | null = $state(null); // Selected day

    function mouseMove(event: MouseEvent) {
        const target = event?.currentTarget as SVGElement | null;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const trueWidth = rect.height * (mapWidth / mapHeight); // rect.width is sometimes wider, height is more accurate
        const trueLeft = (rect.width - trueWidth) / 2;
        const x = (event.clientX - trueLeft) / trueWidth * mapWidth; // X position within the SVG
        const y = (event.clientY - rect.top) / rect.height * mapHeight; // Y position within the SVG
        const adjustedX = x - labelWidth; // Adjust for label width
        const adjustedY = y; // Since labels are at the bottom, we don't need to adjust Y
        selectionX = Math.floor(adjustedX / cellWidth);
        if (selectionX < 0 || selectionX >= 24) {
            selectionX = null; // Out of bounds
            selectionY = null; // Reset Y if X is out of bounds
            return;
        }
        selectionY = Math.floor(adjustedY / (cellHeight + rowPadding));
        if (selectionY < 0 || selectionY >= 4) {
            selectionY = null; // Out of bounds
            selectionX = null; // Reset X if Y is out of bounds
            return;
        }
    }

    function keyPress(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            selectionX = null;
            selectionY = null;
        } else if (
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) &&
            selectionX === null && selectionY === null
        ) {
            selectionX = 0;
            selectionY = 0;
        } else if (event.key === 'ArrowUp' && selectionY !== null) {
            selectionY = (selectionY - 1 + 4) % 4; // Wrap around
        } else if (event.key === 'ArrowDown' && selectionY !== null) {
            selectionY = (selectionY + 1) % 4;
        } else if (event.key === 'ArrowLeft' && selectionX !== null) {
            selectionX = (selectionX - 1 + 24) % 24; // Wrap around
        } else if (event.key === 'ArrowRight' && selectionX !== null) {
            selectionX = (selectionX + 1) % 24;
        }
    }

    function localHour(hour: number): string {
        const date = new Date(currentTime.getTime() + (hour * 60 * 60 * 1000));
        date.setMinutes(0); // Set minutes to 0 for cleaner display
        return date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
    }

    let timeUpdateInterval: ReturnType<typeof setInterval> | null = null;

    onMount(async () => {
        document.addEventListener('keydown', keyPress);
        priceMap = await generatePriceMap(userId, itemId);
        timeUpdateInterval = setInterval(() => {
            currentTime = new Date();
        }, 1000); // Update every second
    });

    onDestroy(() => {
        document.removeEventListener('keydown', keyPress);
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
        }
    });
</script>

<!--
This will be an SVG graph:
Each column will represent an hour of the day (0-23).
Each row will represent a day (0-3).
Inside each cell will be a line representing the price at that hour.
174
-->
<svg onmousemove={mouseMove} role="application" style="width: 100%; height: 100%;" viewBox="0 0 {mapWidth} {mapHeight}">
    {#each Array.from({length: 24}) as _, hour}
        <text
                x={labelWidth + hour * cellWidth}
                y={mapHeight - labelHeight / 3 * 2}
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="12"
        >
            {hour}
        </text>
        <text
                x={labelWidth + hour * cellWidth}
                y={mapHeight - labelHeight / 3}
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="7"
                fill="gray"
                transform="rotate(-40 {labelWidth + hour * cellWidth} {mapHeight - labelHeight / 3})"
        >
            {localHour(hour)}
        </text>
        <line
                x1={labelWidth + hour * cellWidth}
                y1={0}
                x2={labelWidth + hour * cellWidth}
                y2={mapHeight - labelHeight}
                stroke="gray"
                stroke-dasharray="2,2"
                stroke-width="1"
        />
    {/each}
    {#if selectionX !== null && selectionY !== null}
        <rect
                x={labelWidth + (selectionX !== null ? selectionX * cellWidth : 0)}
                y={selectionY !== null ? selectionY * (cellHeight + rowPadding) : 0}
                width={cellWidth}
                height={cellHeight + rowPadding}
                fill="rgba(0, 0, 255, 0.1)"
                stroke="blue"
                stroke-width="1"
        />
        <text
                x={labelWidth / 2}
                y={mapHeight - labelHeight / 2}
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="12"
                font-weight="bold"
                fill="blue"
        >
            {(priceMap[selectionY][selectionX] * 100).toFixed(2)}%
        </text>
    {/if}
    {#each priceMap as dayPrices, day}
        {@const dayHeight = day * (cellHeight + rowPadding) + rowPadding / 2}
        <text
                x={labelWidth / 2}
                y={dayHeight + cellHeight / 2}
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="12"
        >
            Day {day + 1}
        </text>
        <text
                x={labelWidth / 2}
                y={dayHeight + cellHeight}
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="12"
                fill="gray"
        >
            <!-- Day in text (e.g. Mon, Tue, etc.) -->
            {new Date(
                currentTime.getTime() + (day * 24 * 60 * 60 * 1000)
            ).toLocaleDateString('en-US', {
                weekday: 'short'
            })}
        </text>
        <line
                x1="0"
                y1={dayHeight + cellHeight + rowPadding / 2}
                x2={mapWidth}
                y2={dayHeight + cellHeight + rowPadding / 2}
                stroke="gray"
                stroke-dasharray="3,3"
                stroke-width="1"
        />
        {#each dayPrices as price, hour}
            <!-- Prices are 1-price since higher values are lower down -->
            <!-- Three point line -->
            <!-- p1: avg(prev, current) -->
            <!-- p2: current -->
            <!-- p3: avg(current, next) -->
            {@const currentPrice = 1 - price}
            {@const p1 = hour > 0 ? ((1 - priceMap[day][hour - 1]) + currentPrice) / 2 : (
                /* Try to get previous day, if available */
                day > 0 ? ((1 - priceMap[day - 1][23]) + currentPrice) / 2 : currentPrice
            )}
            {@const p2 = currentPrice}
            {@const p3 = hour < 23 ? ((1 - priceMap[day][hour + 1]) + currentPrice) / 2 : (
                /* Try to get next day, if available */
                day < 3 ? ((1 - priceMap[day + 1][0]) + currentPrice) / 2 : currentPrice
            )}
            <line
                    x1={labelWidth + hour * cellWidth}
                    y1={dayHeight + p1 * cellHeight}
                    x2={labelWidth + hour * cellWidth + cellWidth / 2}
                    y2={dayHeight + p2 * cellHeight}
                    stroke="black"
                    stroke-width="2"
            />
            <line
                    x1={labelWidth + hour * cellWidth + cellWidth / 2}
                    y1={dayHeight + p2 * cellHeight}
                    x2={labelWidth + (hour + 1) * cellWidth}
                    y2={dayHeight + p3 * cellHeight}
                    stroke="black"
                    stroke-width="2"
            />
            <circle r="3" cx={labelWidth + hour * cellWidth + cellWidth / 2} cy={dayHeight + p2 * cellHeight}
                    fill="black"/>
        {/each}
    {/each}
    <line
            stroke="red"
            stroke-dasharray="5,5"
            stroke-width="1"
            x1={labelWidth + currentHour * cellWidth}
            x2={labelWidth + currentHour * cellWidth}
            y1="0"
            y2={mapHeight}
    />
</svg>