// Initialiser Supabase avec votre URL de projet et clé publique
const supabaseUrl = 'https://byibwpfmaezicefrexiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWJ3cGZtYWV6aWNlZnJleGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NzEzOTEsImV4cCI6MjA0NDE0NzM5MX0.qJlN0e9mEzydWN0Hx-RHRwlR6T1pNoNEFnrFrZp9vrg';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Fonction pour ajouter une réservation à Supabase
async function addReservationToSupabase(status, startDate, endDate, tarif) {
    const { data, error } = await supabase
        .from('reservations')
        .insert([
            { status: status, start_date: startDate, end_date: endDate, tarif: tarif }
        ]);
    if (error) {
        console.error('Erreur lors de l’ajout de la réservation:', error.message);
    } else {
        console.log('Réservation ajoutée:', data);
        // Ajouter la réservation au tableau et au calendrier
        addReservationToUI(data[0]);
    }
}

// Fonction pour récupérer les réservations depuis Supabase
async function fetchReservationsFromSupabase() {
    const { data, error } = await supabase
        .from('reservations')
        .select('*');
    
    if (error) {
        console.error('Erreur lors de la récupération des réservations:', error.message);
    } else {
        data.forEach(reservation => {
            // Ajouter chaque réservation au tableau et au calendrier
            addReservationToUI(reservation);
        });
    }
}

// Fonction pour supprimer une réservation dans Supabase
async function deleteReservation(id, row) {
    const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Erreur lors de la suppression de la réservation:', error.message);
    } else {
        // Supprimer la réservation de l'UI
        row.remove();
        calendar.getEventById(id)?.remove();
    }
}

// Fonction pour ajouter une réservation à l'UI (tableau et calendrier)
function addReservationToUI(reservation) {
    const { id, status, start_date, end_date, tarif } = reservation;

    // Ajouter la réservation au tableau
    const tableBody = document.getElementById('reservationTable');
    const row = document.createElement('tr');
    
    row.dataset.id = id;
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${status}</td>
        <td class="px-6 py-4 whitespace-nowrap">${formatDate(start_date)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${formatDate(end_date)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${tarif}€</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <button class="editBtn text-blue-500">Modifier</button>
            <button class="deleteBtn text-red-500 ml-4">Supprimer</button>
        </td>
    `;

    tableBody.appendChild(row);

    // Ajouter la réservation dans le calendrier
    calendar.addEvent({
        id: id,
        title: status,
        start: start_date,
        end: end_date,
        color: getColorForStatus(status),
        extendedProps: { tarif: tarif }
    });

    // Ajouter les événements de modification et de suppression
    row.querySelector('.editBtn').addEventListener('click', function () {
        editReservation(row, status, start_date, end_date, tarif);
    });

    row.querySelector('.deleteBtn').addEventListener('click', function () {
        deleteReservation(id, row);
    });
}

// Fonction pour gérer la soumission du formulaire
document.getElementById('reservationForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const status = document.getElementById('status').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const tarif = document.getElementById('tarif').value;

    if (selectedRow) {
        // Fonctionnalité de modification (à implémenter plus tard)
    } else {
        // Ajouter la nouvelle réservation dans Supabase
        addReservationToSupabase(status, startDate, endDate, tarif);
    }
});

// Fonction pour formater la date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

// Fonction pour afficher les détails d'une réservation
function displayEventDetails(event) {
    document.getElementById('detailStatus').textContent = event.title;
    document.getElementById('detailStart').textContent = formatDate(event.startStr);
    document.getElementById('detailEnd').textContent = formatDate(event.endStr || event.startStr);
    document.getElementById('detailTarif').textContent = event.extendedProps.tarif;
    document.getElementById('eventDetails').classList.remove('hidden');
}

// Fonction pour obtenir la couleur en fonction du statut
function getColorForStatus(status) {
    if (status === 'disponible') {
        return 'green';
    } else if (status === 'réservé') {
        return 'red';
    } else if (status === 'promotion') {
        return 'yellow';
    } else {
        return 'gray';
    }
}

// Appeler la fonction au chargement de la page pour récupérer les réservations
document.addEventListener('DOMContentLoaded', function () {
    fetchReservationsFromSupabase();
});
