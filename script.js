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

// Create a mask with specified number of bits set to 1, starting from the left
function createMask(maskBits) {
    if (maskBits == 0) {
        return 0
    } else {
        return (~0) << (32 - maskBits)
    }
}

// Compute the ip address range from 2 arguments.
// parts: a list of 4 integers, each a part from the ip address in the cidr.
// maskBits: number of bits in the bit mask
function computeAddressRange(parts, maskBits) {
    let start = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
    let mask = createMask(maskBits)
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
        <div class="grid cidr-breakdown">
            <label>CIDR</label>
            <input v-model="cidr_input" v-on:input="onInput"></input>

            <label>From</label>
            <div>{{ from_addr }}</div>

            <label>To</label>
            <div>{{ to_addr }}</div>

            <label>Block Size</label>
            <div>{{ block_size }}</div>

            <label>Effective CIDR</label>
            <div>{{ effective_cidr }}</div>

            <template class="grid" v-if="error">
                <label>Error:</label>
                <div>{{ error }}</div>
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
