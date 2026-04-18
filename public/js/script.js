document.addEventListener("DOMContentLoaded", () => {

    const drugLinks = document.querySelectorAll(".drug-link");

    drugLinks.forEach(el => {
        el.addEventListener("click", async () => {
            const drugName = el.dataset.drug;

            try {
                const res = await fetch(
                    `https://api.fda.gov/drug/label.json?search="${drugName}"&limit=1`
                );

                const data = await res.json();
                //console.log("FDA RESPONSE:", data);
                const result = data.results?.[0];

                if (!result) {
                    alert("No data found for this drug.");
                    return;
                }

                document.getElementById("drugTitle").innerText = drugName;
                document.getElementById("drugPurpose").innerText = result.indications_and_usage

                document.getElementById("drugWarnings").innerText = result.boxed_warning

                document.getElementById("drugDescription").innerText = result.description

                document.getElementById("drugModal").classList.remove("hidden");

            } catch (err) {
                console.error(err);
                alert("Failed to fetch drug info.");
            }
        });
    });

    const closeBtn = document.getElementById("closeModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.getElementById("drugModal").classList.add("hidden");
        });
    }

});