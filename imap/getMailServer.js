// const dns = require('dns')

// let accum = []
// const getCnames = (err, result) => {
//     if (err) {
//         // no more records
//         console.log(accum)
//         return accum
//     } else {
//         const cname = result[0]
//         accum.push(cname)
//         return dns.resolveCname(cname, getCnames)
//     }
// }

// dns.resolveCname('www.amagicshop.com.tw', getCnames)

const mxRecords = async () => {
    const dnsPromises = require('dns').promises;
    const demo1 = await dnsPromises.resolveMx("interrait.com");
    console.log(demo1)
}


console.log(mxRecords())