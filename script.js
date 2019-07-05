function parseCidr(cidr) {
    let errorValue = {
        'error': 'Invalid cidr'
    }

    let [start, mask] = cidr.split('/')
    if (start === undefined || mask === undefined) {
        return errorValue
    }


    let parts = start.split('.')
    if (parts.length !== 4) {
        return errorValue
    }

    let intParts = []
    for (part of parts) {
        let intPart = parseInt(part)
        if (intPart >= 0 && intPart <= 255) {
            intParts.push(intPart)
        } else {
            return errorValue
        }
    }

    let intMask = parseInt(mask)
    if (intMask >= 0 && intMask <= 32) {
    } else {
        return errorValue
    }

    return {
        'parts': intParts,
        'maskBits': intMask
    }
}

// Convert an integer to an ip address string
function intToAddr(num) {
    return [num >>> 24, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.')
}

// Compute the ip address range from 2 arguments.
// parts: a list of 4 integers, each a part from the ip address in the cidr.
// maskBits: number of bits in the bit mask
function computeAddressRange(parts, maskBits) {
    let start = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
    let mask = -1 << (32 - maskBits)
    let fromAddr = start & mask
    let toAddr = start | ~mask
    return {
        'from_addr'     : intToAddr(fromAddr),
        'to_addr'       : intToAddr(toAddr),
        'block_size'    : toAddr - fromAddr + 1,
        'effective_cidr': intToAddr(fromAddr) + '/' + maskBits
    }
}

let CidrBreakdownPage = {
    data: function () {
        return {
            cidr_input: "",
            from_addr: "",
            to_addr: "",
            block_size: "",
            effective_cidr: "",
            error: ""
        }
    },
    template: `
        <div class="grid">
            <label>CIDR</label>
            <input v-model="cidr_input" v-on:input="onInput"></input>

            <template class="grid" v-if="from_addr">
                <label>From</label>
                <span>{{ from_addr }}</span>
            </template>

            <template class="grid" v-if="to_addr">
                <label>To</label>
                <span>{{ to_addr }}</span>
            </template>

            <template class="grid" v-if="block_size">
                <label>Block Size</label>
                <span>{{ block_size }}</span>
            </template>

            <template class="grid" v-if="effective_cidr">
                <label>Effective CIDR</label>
                <span>{{ effective_cidr }}</span>
            </template>

            <template class="grid" v-if="error">
                <label>Error:</label>
                <span>{{ error }}</span>
            </template>
        </div>
    `,
    methods: {
        onInput: function () {
            let {parts, maskBits, error} = parseCidr(this.cidr_input)
            this.error = error
            if (error) {
                this.from_addr = ""
                this.to_addr = ""
            } else {
                let breakdown = computeAddressRange(parts, maskBits)
                this.from_addr = breakdown.from_addr
                this.to_addr = breakdown.to_addr
                this.block_size = breakdown.block_size
                this.effective_cidr = breakdown.effective_cidr
            }
        }
    }
}

var vm = new Vue({
    el: '#root',
    data: {
    },
    components: {
        CidrBreakdownPage
    }
})
